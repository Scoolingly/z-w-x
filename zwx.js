const crypto = require("crypto");
const { MongoClient: MClnt } = require("mongodb");

const v1 = process.env.X1, v2 = process.env.X2, v3 = process.env.X3, v4 = process.env.X4;
const n1 = process.env.Y1, n2 = process.env.Y2, n3 = process.env.Y3, n4 = JSON.parse(process.env.Y4);
const u1 = process.env.Z1, u2 = process.env.H1, u3 = parseInt(process.env.Z2 || "180");

const p1 = { A: "/authorization", B: "/alarm/list", C: "/publish_api/v1/instances/" };

const q1 = { A: "authorization", B: "account", C: "signature", D: "access_token", E: "imei", F: "begintime", G: "endtime", H: "alarmType", I: "longitude", J: "latitude", K: "gpstime", L: "systemTime", M: "speed", N: "course", O: "geoFenceId" };

let t1 = null, t2 = 0, t3 = false, d2 = null;

const p3 = async () => {
    if (!d2) {
        d2 = new MClnt(n1, { useNewUrlParser: true, useUnifiedTopology: true });
        await d2.connect();
    }
    return d2.db(n2).collection(n3);
};

const p4 = async () => {
    if (t3) return;
    t3 = true;
    try {
        const x1 = Math.floor(Date.now() / 1000);
        const x2 = crypto.createHash("md5").update(crypto.createHash("md5").update(v1).digest("hex") + x1).digest("hex");

        const r2 = await fetch(`${u1}${p1.A}?time=${x1}&${q1.B}=${v2}&${q1.C}=${x2}`);
        if (!r2.ok) throw new Error(`Error occurred: ${r2.status}`);

        const r3 = await r2.json();
        if (r3.code === 0 && r3.record && r3.record[q1.D]) {
            t1 = r3.record;
            t2 = (x1 + r3.record.expires_in) * 1000;

            const c1 = await p3();
            await c1.updateOne({}, { $set: { [q1.D]: t1[q1.D], validity: t2 } }, { upsert: true });
        } else {
            throw new Error("Error occurred: 401");
        }
    } catch (e) {
        console.error("Error in p4:", e);
    } finally {
        t3 = false;
    }
};

const p5 = async () => {
    if (t1 && Date.now() < t2) return t1;
    try {
        const c1 = await p3();
        const c2 = await c1.findOne({});
        if (c2 && c2[q1.D] && Date.now() < c2.validity) {
            t1 = { [q1.D]: c2[q1.D], expires_in: Math.floor((c2.validity - Date.now()) / 1000) };
            t2 = c2.validity;
            return t1;
        }
        await p4();
        return await p5();
    } catch (e) {
        console.error("Error in p5:", e);
    }
};

const p6 = async (x1, x2, x3) => {
    try {
        const x4 = await p5();
        if (!x4) throw new Error("Error occurred: 403");

        const r2 = await fetch(`${u1}${p1.B}?${q1.D}=${x4[q1.D]}&${q1.E}=${x1}&${q1.F}=${x2}&${q1.G}=${x3}`);
        if (!r2.ok) throw new Error(`Error occurred: ${r2.status}`);

        const r3 = await r2.json();
        if (r3.code === 0 && r3.record) {
            return r3.record.split(";").reduce((a, _, i, b) => {
                if (i % 8 === 0 && b[i]) {
                    a.push({ [q1.H]: b[i], [q1.I]: b[i + 1], [q1.J]: b[i + 2], [q1.K]: b[i + 3], [q1.L]: b[i + 4], [q1.M]: b[i + 5], [q1.N]: b[i + 6], [q1.O]: b[i + 7] });
                }
                return a;
            }, []);
        }
        return [];
    } catch (e) {
        console.error("Error in p6:", e);
        return [];
    }
};

const p7 = async (x1, x2, x3) => {
    try {
        const r2 = await fetch(`https://${v3}.${u2}${p1.C}${v3}/publishes`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${v4}` },
            body: JSON.stringify({
                interests: [`${x1}_${x2}`],
                fcm: {
                    notification: {
                        title: "New Alarm!",
                        body: `Alarm Type: ${x3[q1.H]}, IMEI: ${x1}, GeoFence ID: ${x2}, Time: ${x3[q1.K]}`
                    },
                    data: { ...x3, imei: x1 }
                }
            })
        });
        if (!r2.ok) throw new Error(`Error occurred: ${r2.status}`);
    } catch (e) {
        console.error("Error in p7:", e);
    }
};

const p8 = async (x1) => {
    const x2 = Math.floor(Date.now() / 1000);
    const x3 = x2 - u3;
    const x4 = await p6(x1, x3, x2);
    if (!x4.length) return;
    const x5 = x4.filter(x => x && (x[q1.H] === "5" || x[q1.H] === "6")).map(x => p7(x1, x[q1.O], x));
    await Promise.all(x5);
};

const p9 = async () => {
    try {
        await Promise.all(n4.map(x => p8(x)));
    } catch (e) {
        console.error("Error in p9:", e);
    } finally {
        if (d2) await d2.close();
    }
};

(async () => {
    try {
        await p9();
    } catch (e) {
        console.error("Top-level error:", e);
    }
})();
