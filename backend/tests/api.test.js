// ─────────────────────────────────────────────────────────────────────────
// Pruebas de integración de la API (flujos de cliente).
//
// Requisitos: un MongoDB local (o compatible) escuchando en
// mongodb://127.0.0.1:27017 — o define TEST_DB_URI. La base de pruebas se
// BORRA al iniciar, así que nunca apuntes TEST_DB_URI a la base real.
//
//   npm test
//
// Los correos no se envían: nodemailer se reemplaza por un mock
// (tests/helpers/nodemailer-mock.js) y el código se lee desde ahí.
// ─────────────────────────────────────────────────────────────────────────
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jsonwebtoken from "jsonwebtoken";

const { default: app } = await import("../app.js");
const { default: clientModel } = await import("../src/models/client.js");
const { default: adminModel } = await import("../src/models/admin.js");
const { default: productModel } = await import("../src/models/product.js");
const { default: saleModel } = await import("../src/models/sale.js");
const { default: cartModel } = await import("../src/models/shopping_cart.js");

let server;
let base;
const sentMails = globalThis.__sentMails;

const api = async (method, path, { body, token, headers = {} } = {}) => {
    const res = await fetch(`${base}/api${path}`, {
        method,
        headers: {
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data, headers: res.headers };
};

const lastCode = () => {
    const mail = sentMails.at(-1);
    return mail.text.match(/código: ([0-9a-f]{6})/)[1];
};

const adultBirthdate = "1995-04-20";
const today = new Date();
const minorBirthdate = `${today.getUTCFullYear() - 17}-01-01`;

// Registra un cliente completo (registro + verificación) y devuelve su token.
const createClient = async (email, password = "clave1234") => {
    const reg = await api("POST", "/registerClient", {
        body: { name: "Ana", lastname: "López", birthdate: adultBirthdate, email, password },
    });
    assert.equal(reg.status, 200, JSON.stringify(reg.data));
    const verify = await api("POST", "/registerClient/verifyCodeEmail", {
        body: { verificationCodeRequest: lastCode(), registrationToken: reg.data.registrationToken },
    });
    assert.equal(verify.status, 200, JSON.stringify(verify.data));
    const login = await api("POST", "/login", { body: { email, password } });
    assert.equal(login.status, 200, JSON.stringify(login.data));
    return { token: login.data.token, user: login.data.user };
};

let p1, p2, p3;

before(async () => {
    await mongoose.connect(process.env.DB_URI);
    await mongoose.connection.db.dropDatabase();
    await saleModel.syncIndexes();
    await clientModel.syncIndexes();
    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}`;
    p1 = await productModel.create({ name: "Garrafón 20L", product_type: "Garrafones", price: 3.5, stock: 5, flavor: "Natural", size: "20L" });
    p2 = await productModel.create({ name: "Botella 600ml", product_type: "Botellas", price: 0.5, stock: 100 });
    p3 = await productModel.create({ name: "Pack 12", product_type: "Packs", price: 4, stock: 1 });
});

after(async () => {
    server?.close();
    await mongoose.disconnect();
});

// ── Registro ───────────────────────────────────────────────────────────
test("registro: rechaza menores de 18 ANTES de enviar el correo", async () => {
    const before = sentMails.length;
    const r = await api("POST", "/registerClient", {
        body: { name: "Leo", lastname: "Pérez", birthdate: minorBirthdate, email: "menor@test.com", password: "clave1234" },
    });
    assert.equal(r.status, 400);
    assert.match(r.data.message, /mayor de 18/);
    assert.equal(sentMails.length, before, "no debe enviarse correo");
});

test("registro: valida nombre, fecha futura/inválida y contraseña corta", async () => {
    const bad = [
        [{ name: "Juan123" }, /solo puede contener letras/],
        [{ birthdate: "2999-01-01" }, /futura/],
        [{ birthdate: "2001-02-31" }, /inválida/],
        [{ password: "corta" }, /al menos 8/],
        [{ email: "no-es-correo" }, /correo válido/],
    ];
    for (const [patch, pattern] of bad) {
        const r = await api("POST", "/registerClient", {
            body: { name: "Juan", lastname: "Pérez", birthdate: adultBirthdate, email: "x@test.com", password: "clave1234", ...patch },
        });
        assert.equal(r.status, 400, JSON.stringify(patch));
        assert.match(r.data.message, pattern);
    }
});

test("registro: acepta juan+1@gmail.com y normaliza mayúsculas", async () => {
    const r = await api("POST", "/registerClient", {
        body: { name: "Juan", lastname: "Pérez", birthdate: adultBirthdate, email: "  Juan+1@Gmail.com ", password: "clave1234" },
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(sentMails.at(-1).to, "juan+1@gmail.com");
    assert.equal(r.data.resendAfter, 60);
    // Código en MAYÚSCULAS (como lo escribiría un teclado con autocapitalización)
    const v = await api("POST", "/registerClient/verifyCodeEmail", {
        body: { verificationCodeRequest: lastCode().toUpperCase(), registrationToken: r.data.registrationToken },
    });
    assert.equal(v.status, 200, JSON.stringify(v.data));
    const saved = await clientModel.findOne({ email: "juan+1@gmail.com" });
    assert.ok(saved);
});

test("registro: reenvío con cooldown (429 + retryAfter)", async () => {
    const body = { name: "Rosa", lastname: "Díaz", birthdate: adultBirthdate, email: "rosa@test.com", password: "clave1234" };
    const first = await api("POST", "/registerClient", { body });
    assert.equal(first.status, 200);
    const second = await api("POST", "/registerClient", { body });
    assert.equal(second.status, 429);
    assert.equal(second.data.code, "CODE_COOLDOWN");
    assert.ok(second.data.retryAfter > 0 && second.data.retryAfter <= 60);
    assert.equal(second.headers.get("retry-after"), String(second.data.retryAfter));
});

test("registro: si falla el correo no queda bloqueado el reenvío", async () => {
    globalThis.__failNextMail = true;
    const body = { name: "Tito", lastname: "Paz", birthdate: adultBirthdate, email: "tito@test.com", password: "clave1234" };
    const r = await api("POST", "/registerClient", { body });
    assert.equal(r.status, 502);
    const retry = await api("POST", "/registerClient", { body });
    assert.equal(retry.status, 200);
});

test("registro: código incorrecto, con formato inválido y expirado", async () => {
    const r = await api("POST", "/registerClient", {
        body: { name: "Eva", lastname: "Luna", birthdate: adultBirthdate, email: "eva@test.com", password: "clave1234" },
    });
    const token = r.data.registrationToken;
    const wrong = lastCode() === "000000" ? "000001" : "000000";
    const bad = await api("POST", "/registerClient/verifyCodeEmail", { body: { verificationCodeRequest: wrong, registrationToken: token } });
    assert.equal(bad.status, 400);
    assert.equal(bad.data.code, "CODE_INVALID");

    const format = await api("POST", "/registerClient/verifyCodeEmail", { body: { verificationCodeRequest: "xyz", registrationToken: token } });
    assert.equal(format.status, 400);
    assert.equal(format.data.code, "CODE_FORMAT");

    const expired = jsonwebtoken.sign(
        { randomNumber: "abc123", name: "Eva", lastname: "Luna", birthdate: adultBirthdate, email: "eva@test.com", password: "clave1234", exp: Math.floor(Date.now() / 1000) - 10 },
        process.env.JWT_SECRET_KEY
    );
    const exp = await api("POST", "/registerClient/verifyCodeEmail", { body: { verificationCodeRequest: "abc123", registrationToken: expired } });
    assert.equal(exp.status, 400);
    assert.equal(exp.data.code, "CODE_EXPIRED");
    assert.match(exp.data.message, /expiró/);

    const none = await api("POST", "/registerClient/verifyCodeEmail", { body: { verificationCodeRequest: "abc123" } });
    assert.equal(none.status, 400);
    assert.equal(none.data.code, "SESSION_MISSING");
});

test("registro: correo ya registrado → 409", async () => {
    const r = await api("POST", "/registerClient", {
        body: { name: "Juan", lastname: "Pérez", birthdate: adultBirthdate, email: "JUAN+1@gmail.com", password: "clave1234" },
    });
    assert.equal(r.status, 409);
});

// ── Login ──────────────────────────────────────────────────────────────
test("login: correo con mayúsculas, credenciales genéricas y datos del usuario", async () => {
    const ok = await api("POST", "/login", { body: { email: "JUAN+1@GMAIL.COM", password: "clave1234" } });
    assert.equal(ok.status, 200, JSON.stringify(ok.data));
    assert.equal(ok.data.userType, "Client");
    assert.equal(ok.data.user.name, "Juan");
    assert.equal(ok.data.user.email, "juan+1@gmail.com");
    assert.ok(ok.data.token);

    const wrongPass = await api("POST", "/login", { body: { email: "juan+1@gmail.com", password: "otraclave" } });
    const noUser = await api("POST", "/login", { body: { email: "nadie@test.com", password: "otraclave" } });
    assert.equal(wrongPass.status, 401);
    assert.equal(noUser.status, 401);
    assert.equal(wrongPass.data.message, noUser.data.message, "no debe revelar si el correo existe");
});

test("login: bloqueo tras 5 intentos fallidos con mensaje claro", async () => {
    await createClient("bloqueo@test.com");
    let last;
    for (let i = 0; i < 5; i++) {
        last = await api("POST", "/login", { body: { email: "bloqueo@test.com", password: "incorrecta" } });
    }
    assert.equal(last.status, 403);
    assert.equal(last.data.code, "ACCOUNT_LOCKED");
    assert.match(last.data.message, /minuto/);
});

test("login: un admin recibe userType Admin (la app móvil lo rechaza)", async () => {
    await adminModel.create({ name: "Admin", lastname: "Uno", email: "admin@test.com", password: "admin12345" });
    const r = await api("POST", "/login", { body: { email: "Admin@Test.com", password: "admin12345" } });
    assert.equal(r.status, 200);
    assert.equal(r.data.userType, "Admin");
});

// ── Sesión ─────────────────────────────────────────────────────────────
test("sesión: token inválido o vencido → 401 SESSION_EXPIRED", async () => {
    const bad = await api("GET", "/sales/mine", { token: "no-es-un-token" });
    assert.equal(bad.status, 401);
    assert.equal(bad.data.code, "SESSION_EXPIRED");
    const expired = jsonwebtoken.sign({ id: new mongoose.Types.ObjectId().toString(), userType: "Client", exp: Math.floor(Date.now() / 1000) - 5 }, process.env.JWT_SECRET_KEY);
    const exp = await api("GET", "/sales/mine", { token: expired });
    assert.equal(exp.status, 401);
    const none = await api("GET", "/sales/mine");
    assert.equal(none.status, 401);
});

// ── Perfil ─────────────────────────────────────────────────────────────
test("perfil: GET propio sí, ajeno no; sin password en la respuesta", async () => {
    const a = await createClient("perfil-a@test.com");
    const b = await createClient("perfil-b@test.com");
    const mine = await api("GET", `/clients/${a.user.id}`, { token: a.token });
    assert.equal(mine.status, 200);
    assert.equal(mine.data.email, "perfil-a@test.com");
    assert.equal(mine.data.password, undefined);
    const other = await api("GET", `/clients/${b.user.id}`, { token: a.token });
    assert.equal(other.status, 403);
});

test("perfil: editar nombre/fecha, ignorar campos internos y `password` suelto", async () => {
    const a = await createClient("editar@test.com", "clave1234");
    const r = await api("PUT", `/clients/${a.user.id}`, {
        token: a.token,
        body: { name: "María José", lastname: "O'Neil", birthdate: "1990-12-01", password: "placeholder_no_change", verified_email: false, loginAttemps: 99 },
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.client.name, "María José");
    assert.equal(r.data.client.birthdate.slice(0, 10), "1990-12-01");
    const saved = await clientModel.findById(a.user.id);
    assert.equal(saved.verified_email, true);
    assert.notEqual(saved.loginAttemps, 99);
    // La contraseña NO cambió (antes se guardaba "placeholder_no_change" en texto plano)
    const login = await api("POST", "/login", { body: { email: "editar@test.com", password: "clave1234" } });
    assert.equal(login.status, 200);

    const badName = await api("PUT", `/clients/${a.user.id}`, { token: a.token, body: { name: "R2D2" } });
    assert.equal(badName.status, 400);
    const minor = await api("PUT", `/clients/${a.user.id}`, { token: a.token, body: { birthdate: minorBirthdate } });
    assert.equal(minor.status, 400);
    const email = await api("PUT", `/clients/${a.user.id}`, { token: a.token, body: { email: "otro@test.com" } });
    assert.equal(email.status, 400);
});

test("perfil: el admin del panel web puede editar sin romper la contraseña del cliente", async () => {
    const c = await createClient("webadmin@test.com", "clave1234");
    const admin = await api("POST", "/login", { body: { email: "admin@test.com", password: "admin12345" } });
    // Igual que Clients.jsx: name, lastname, email y el password placeholder
    const r = await api("PUT", `/clients/${c.user.id}`, {
        token: admin.data.token,
        body: { name: "Ana", lastname: "Martínez", email: "webadmin@test.com", password: "placeholder_no_change" },
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    const login = await api("POST", "/login", { body: { email: "webadmin@test.com", password: "clave1234" } });
    assert.equal(login.status, 200);
});

test("perfil: cambiar contraseña exige la actual y queda hasheada", async () => {
    const a = await createClient("pass@test.com", "clave1234");
    const wrong = await api("PUT", `/clients/${a.user.id}`, { token: a.token, body: { currentPassword: "mala", newPassword: "nueva12345" } });
    assert.equal(wrong.status, 400);
    assert.equal(wrong.data.field, "currentPassword");
    const short = await api("PUT", `/clients/${a.user.id}`, { token: a.token, body: { currentPassword: "clave1234", newPassword: "corta" } });
    assert.equal(short.status, 400);
    const ok = await api("PUT", `/clients/${a.user.id}`, { token: a.token, body: { currentPassword: "clave1234", newPassword: "nueva12345" } });
    assert.equal(ok.status, 200);
    const raw = await clientModel.findById(a.user.id).select("+password");
    assert.notEqual(raw.password, "nueva12345");
    assert.equal((await api("POST", "/login", { body: { email: "pass@test.com", password: "nueva12345" } })).status, 200);
    assert.equal((await api("POST", "/login", { body: { email: "pass@test.com", password: "clave1234" } })).status, 401);
});

test("perfil: eliminar cuenta exige contraseña e invalida el token", async () => {
    const a = await createClient("borrar@test.com", "clave1234");
    const noPass = await api("DELETE", `/clients/${a.user.id}`, { token: a.token, body: {} });
    assert.equal(noPass.status, 400);
    const ok = await api("DELETE", `/clients/${a.user.id}`, { token: a.token, body: { password: "clave1234" } });
    assert.equal(ok.status, 200);
    const after = await api("GET", "/sales/mine", { token: a.token });
    assert.equal(after.status, 401);
});

// ── Carrito y ventas ───────────────────────────────────────────────────
let buyer, other;

test("carrito: ignora descuento del cliente, combina repetidos y valida stock", async () => {
    buyer = await createClient("comprador@test.com");
    other = await createClient("otro@test.com");
    const r = await api("POST", "/shopping-carts", {
        token: buyer.token,
        body: { products: [{ product_id: p2._id.toString(), amount: 2 }, { product_id: p2._id.toString(), amount: 1 }], discount: 1000 },
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.cart.discount, 0);
    assert.equal(r.data.cart.products.length, 1);
    assert.equal(r.data.cart.products[0].amount, 3);
    assert.equal(r.data.cart.total_with_discount, 1.5);

    const tooMany = await api("POST", "/shopping-carts", { token: buyer.token, body: { products: [{ product_id: p1._id.toString(), amount: 6 }] } });
    assert.equal(tooMany.status, 409);
    assert.equal(tooMany.data.code, "INSUFFICIENT_STOCK");
    assert.equal(tooMany.data.available, 5);
    assert.match(tooMany.data.message, /Stock insuficiente para Garrafón 20L/);

    const empty = await api("POST", "/shopping-carts", { token: buyer.token, body: { products: [] } });
    assert.equal(empty.status, 400);
    const badQty = await api("POST", "/shopping-carts", { token: buyer.token, body: { products: [{ product_id: p2._id.toString(), amount: 1.5 }] } });
    assert.equal(badQty.status, 400);

    const foreign = await api("GET", `/shopping-carts/${r.data.cart._id}`, { token: other.token });
    assert.equal(foreign.status, 403);
});

test("venta: dueño, payment_status forzado, envío, total y stock descontado", async () => {
    const cart = await api("POST", "/shopping-carts", { token: buyer.token, body: { products: [{ product_id: p1._id.toString(), amount: 2 }] } });
    const cartId = cart.data.cart._id;

    const stolen = await api("POST", "/sales", {
        token: other.token,
        body: { shopping_cart_id: cartId, delivery_address: "Col. Escalón, casa 25", payment_method: "Efectivo" },
    });
    assert.equal(stolen.status, 403);

    const sale = await api("POST", "/sales", {
        token: buyer.token,
        body: { shopping_cart_id: cartId, delivery_address: "Col. Escalón, casa 25", payment_method: "Efectivo", payment_status: "paid" },
    });
    assert.equal(sale.status, 201, JSON.stringify(sale.data));
    assert.equal(sale.data.sale.payment_status, "pending");
    assert.equal(sale.data.sale.shipping_cost, 1.5);
    assert.equal(sale.data.sale.total, 8.5);
    assert.equal((await productModel.findById(p1._id)).stock, 3);

    const dup = await api("POST", "/sales", {
        token: buyer.token,
        body: { shopping_cart_id: cartId, delivery_address: "Col. Escalón, casa 25", payment_method: "Efectivo" },
    });
    assert.equal(dup.status, 409);
    assert.equal((await productModel.findById(p1._id)).stock, 3, "no debe descontar dos veces");
});

test("venta: dirección o método inválido → 400 y el carrito huérfano se elimina", async () => {
    const cart = await api("POST", "/shopping-carts", { token: buyer.token, body: { products: [{ product_id: p2._id.toString(), amount: 1 }] } });
    const r = await api("POST", "/sales", { token: buyer.token, body: { shopping_cart_id: cart.data.cart._id, delivery_address: "Casa", payment_method: "Efectivo" } });
    assert.equal(r.status, 400);
    assert.equal(await cartModel.exists({ _id: cart.data.cart._id }), null);

    const cart2 = await api("POST", "/shopping-carts", { token: buyer.token, body: { products: [{ product_id: p2._id.toString(), amount: 1 }] } });
    const r2 = await api("POST", "/sales", { token: buyer.token, body: { shopping_cart_id: cart2.data.cart._id, delivery_address: "Col. Escalón, casa 25", payment_method: "Bitcoin" } });
    assert.equal(r2.status, 400);
});

test("venta: dos compras simultáneas del último producto → solo una gana", async () => {
    const c1 = await api("POST", "/shopping-carts", { token: buyer.token, body: { products: [{ product_id: p3._id.toString(), amount: 1 }] } });
    const c2 = await api("POST", "/shopping-carts", { token: other.token, body: { products: [{ product_id: p3._id.toString(), amount: 1 }] } });
    assert.equal(c1.status, 200);
    assert.equal(c2.status, 200);
    const body = (id) => ({ shopping_cart_id: id, delivery_address: "Col. Escalón, casa 25", payment_method: "Tarjeta" });
    const [s1, s2] = await Promise.all([
        api("POST", "/sales", { token: buyer.token, body: body(c1.data.cart._id) }),
        api("POST", "/sales", { token: other.token, body: body(c2.data.cart._id) }),
    ]);
    const statuses = [s1.status, s2.status].sort();
    assert.deepEqual(statuses, [201, 409]);
    assert.equal((await productModel.findById(p3._id)).stock, 0);
});

test("venta: el precio se recalcula desde la base al confirmar", async () => {
    const cart = await api("POST", "/shopping-carts", { token: buyer.token, body: { products: [{ product_id: p2._id.toString(), amount: 2 }] } });
    await productModel.updateOne({ _id: p2._id }, { price: 0.75 });
    const sale = await api("POST", "/sales", { token: buyer.token, body: { shopping_cart_id: cart.data.cart._id, delivery_address: "Col. Escalón, casa 25", payment_method: "Transferencia" } });
    assert.equal(sale.status, 201);
    assert.equal(sale.data.sale.total, 1.5 + 1.5);
    assert.equal(sale.data.sale.shopping_cart_id.total_with_discount, 1.5);
});

test("mis pedidos: solo los propios, más recientes primero y con productos", async () => {
    const mine = await api("GET", "/sales/mine", { token: buyer.token });
    assert.equal(mine.status, 200);
    assert.ok(mine.data.length >= 2);
    for (const s of mine.data) {
        assert.equal(s.shopping_cart_id.user_id.toString(), buyer.user.id);
    }
    const dates = mine.data.map((s) => new Date(s.createdAt).getTime());
    assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
    assert.ok(mine.data[0].shopping_cart_id.products[0].product_id.name);
    const others = await api("GET", "/sales/mine", { token: other.token });
    assert.ok(others.data.every((s) => s.shopping_cart_id.user_id.toString() === other.user.id));
});

// ── Reseñas ────────────────────────────────────────────────────────────
test("reseñas: solo si compró, sin duplicados, y getMine con imágenes", async () => {
    const notBought = await api("POST", "/reviews", { token: other.token, body: { product_id: p1._id.toString(), rating: 5 } });
    assert.equal(notBought.status, 403);
    assert.equal(notBought.data.code, "NOT_PURCHASED");

    const badRating = await api("POST", "/reviews", { token: buyer.token, body: { product_id: p1._id.toString(), rating: 7 } });
    assert.equal(badRating.status, 400);

    const ok = await api("POST", "/reviews", { token: buyer.token, body: { product_id: p1._id.toString(), rating: 4, comment: "  Muy buena  " } });
    assert.equal(ok.status, 201, JSON.stringify(ok.data));
    assert.equal(ok.data.review.comment, "Muy buena");

    const dup = await api("POST", "/reviews", { token: buyer.token, body: { product_id: p1._id.toString(), rating: 5 } });
    assert.equal(dup.status, 409);
    assert.equal(dup.data.code, "ALREADY_REVIEWED");

    const mine = await api("GET", "/reviews/mine", { token: buyer.token });
    assert.equal(mine.status, 200);
    assert.equal(mine.data[0].product_id.name, "Garrafón 20L");
    assert.ok(Array.isArray(mine.data[0].product_id.images));

    const byProduct = await api("GET", `/reviews/product/${p1._id}`);
    assert.equal(byProduct.data.count, 1);
    assert.equal(byProduct.data.average, 4);
    const badId = await api("GET", "/reviews/product/123");
    assert.equal(badId.status, 400);
});

// ── Recuperación de contraseña ─────────────────────────────────────────
test("recuperación: código en mayúsculas, expirado, cooldown y nueva contraseña", async () => {
    await createClient("recupera@test.com", "clave1234");
    const notFound = await api("POST", "/recoveryClient/requestCode", { body: { email: "nadie@test.com" } });
    assert.equal(notFound.status, 404);

    const req1 = await api("POST", "/recoveryClient/requestCode", { body: { email: " Recupera@Test.com " } });
    assert.equal(req1.status, 200, JSON.stringify(req1.data));
    const cooldown = await api("POST", "/recoveryClient/requestCode", { body: { email: "recupera@test.com" } });
    assert.equal(cooldown.status, 429);

    const wrong = await api("POST", "/recoveryClient/verifyCode", { body: { code: lastCode() === "000000" ? "000001" : "000000", recoveryToken: req1.data.recoveryToken } });
    assert.equal(wrong.status, 400);
    assert.equal(wrong.data.code, "CODE_INVALID");

    const expiredToken = jsonwebtoken.sign({ email: "recupera@test.com", randomCode: "abc123", verified: false, exp: Math.floor(Date.now() / 1000) - 1 }, process.env.JWT_SECRET_KEY);
    const expired = await api("POST", "/recoveryClient/verifyCode", { body: { code: "abc123", recoveryToken: expiredToken } });
    assert.equal(expired.status, 400, "antes respondía 500");
    assert.equal(expired.data.code, "CODE_EXPIRED");

    const verified = await api("POST", "/recoveryClient/verifyCode", { body: { code: lastCode().toUpperCase(), recoveryToken: req1.data.recoveryToken } });
    assert.equal(verified.status, 200, JSON.stringify(verified.data));

    // Un token ya verificado no puede reusarse para "verificar" sin código
    const replay = await api("POST", "/recoveryClient/verifyCode", { body: { recoveryToken: verified.data.recoveryToken } });
    assert.equal(replay.status, 400);

    const mismatch = await api("POST", "/recoveryClient/newPassword", { body: { newPassword: "nueva12345", confirmNewPassword: "otra12345", recoveryToken: verified.data.recoveryToken } });
    assert.equal(mismatch.status, 400);
    const notVerified = await api("POST", "/recoveryClient/newPassword", { body: { newPassword: "nueva12345", confirmNewPassword: "nueva12345", recoveryToken: req1.data.recoveryToken } });
    assert.equal(notVerified.status, 400);
    const done = await api("POST", "/recoveryClient/newPassword", { body: { newPassword: "nueva12345", confirmNewPassword: "nueva12345", recoveryToken: verified.data.recoveryToken } });
    assert.equal(done.status, 200);
    assert.equal((await api("POST", "/login", { body: { email: "recupera@test.com", password: "nueva12345" } })).status, 200);
});

// ── Varios ─────────────────────────────────────────────────────────────
test("JSON inválido → 400 con mensaje", async () => {
    const res = await fetch(`${base}/api/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{mal" });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /JSON/);
});
