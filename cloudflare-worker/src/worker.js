// Hotel Booking API - Cloudflare Worker + D1
// Endpoints:
//   GET  /                  → homepage with real-time availability & booking
//   GET  ?action=availability → room counts JSON
//   POST ?action=book         → book a room
//   GET  ?action=bookings     → HTML booking list
//   GET  ?action=bookings&format=csv → CSV export

const NOTIFY_EMAIL = "mingkaiz312@gmail.com";
const RESEND_KEY = "re_ZbsdpwBz_347jFXBYXMSPsbj3c9qEcLNb";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    try {
      if (!action) return await handleHome(env);
      if (action === "availability") return await handleAvailability(env, cors);
      if (action === "book" && request.method === "POST") return await handleBook(request, env, cors);
      if (action === "bookings") return await handleBookings(env, cors, url.searchParams.get("format"));
      if (action === "bookings-csv") return await handleBookingsCSV(env, cors);
      if (action === "reset" && request.method === "POST") return await handleReset(env, cors);
      if (action === "delete" && request.method === "POST") return await handleDelete(request, env, cors);
      return json({ success: false, message: "Unknown action" }, 400, cors);
    } catch (e) {
      return json({ success: false, message: e.message }, 500, cors);
    }
  },
};

// Default landing page with real-time availability & booking
async function handleHome(env) {
  const { results } = await env.DB.prepare("SELECT type, price, date_key, available FROM rooms ORDER BY id").all();
  const roomMap = {};
  for (const r of results) {
    if (!roomMap[r.type]) roomMap[r.type] = { type: r.type, price: r.price, daily: {} };
    roomMap[r.type].daily[r.date_key] = r.available;
  }
  const roomData = JSON.stringify(Object.values(roomMap));
  const html = `<!doctype html><html lang="en-US"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Accommodation Booking – 5th XMU Symposium</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f5f5;color:#333;font-size:16px;line-height:1.7}
.c{max-width:960px;margin:0 auto;padding:20px}
.hdr{background:#122E66;color:#fff;text-align:center;padding:32px 20px;margin-bottom:24px;border-radius:0 0 12px 12px}
.hdr h1{font-size:22px;font-weight:700}.hdr p{font-size:13px;opacity:.75;margin-top:4px}
.card{background:#fff;border-radius:10px;padding:28px 24px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.card h2{color:#122E66;font-size:18px;border-bottom:2px solid #122E66;padding-bottom:8px;margin-bottom:16px}
table{width:100%;border-collapse:collapse;font-size:14px}
th{background:#122E66;color:#fff;padding:10px 12px;text-align:center;font-weight:600}
td{padding:10px 12px;border:1px solid #e0e0e0;text-align:center}
tr:nth-child(even) td{background:#f8f8f8}
.avail{color:#28a745;font-weight:700}.full{color:#dc3545;font-weight:700}
label{display:block;font-weight:600;margin:12px 0 4px;color:#122E66}
input,select{width:100%;padding:12px 14px;border:2px solid #e0e0e0;border-radius:8px;font-size:15px;background:#fff;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 12 12%27%3E%3Cpath fill=%27%23122E66%27 d=%27M6 8L1 3h10z%27/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;transition:border-color .2s}input:focus,select:focus{border-color:#122E66;outline:none;box-shadow:0 0 0 3px rgba(18,46,102,.1)}
.btn{display:block;width:100%;background:#122E66;color:#fff;border:none;padding:14px;border-radius:6px;font-size:17px;font-weight:700;cursor:pointer;margin-top:20px}
.btn:hover{background:#1a3d7c}.btn:disabled{opacity:.5;cursor:not-allowed}
.msg{margin-top:12px;text-align:center;font-weight:600}
.ft{text-align:center;padding:16px;color:#aaa;font-size:12px}
.ft a{color:#122E66;text-decoration:none}
@media (max-width:768px){
  body{font-size:15px}
  .c{padding:12px}
  .hdr{padding:20px 14px;margin-bottom:16px;border-radius:0 0 8px 8px}
  .hdr h1{font-size:18px}
  .hdr p{font-size:12px}
  .card{padding:18px 14px;margin-bottom:14px;border-radius:8px}
  .card h2{font-size:16px;margin-bottom:12px}
  table{font-size:11px}
  th,td{padding:6px 8px}
  input,select{padding:14px 12px;font-size:16px;background-position:right 10px center;padding-right:32px}
  .btn{padding:16px;font-size:18px}
  .msg{font-size:14px}
}
</style></head>
<body>
<div class="hdr"><h1>&#127968; Accommodation Booking</h1><p>5th XMU Symposium on Light–Matter Interactions in Nanostructures<br>Dec 18–22, 2026 · Xiamen University Malaysia</p></div>
<div class="c">
<div class="card">
<h2>Room Availability</h2>
<div id="roomTable">Loading availability...</div>
</div>
<div class="card">
<h2>Book a Room</h2>
<form id="bookForm">
<label>Room Type *</label><select id="roomType" required></select>
<label>Full Name *</label><input type="text" id="guestName" required>
<label>Email *</label><input type="email" id="guestEmail" required>
<label>Check-in *</label><select id="checkin" required><option value="">Select date...</option><option value="Dec 17">Dec 17 (Wed)</option><option value="Dec 18">Dec 18 (Thu)</option><option value="Dec 19">Dec 19 (Fri)</option><option value="Dec 20">Dec 20 (Sat)</option><option value="Dec 21">Dec 21 (Sun)</option><option value="Dec 22">Dec 22 (Mon)</option></select>
<label>Check-out *</label><select id="checkout" required><option value="">Select date...</option><option value="Dec 18">Dec 18 (Thu)</option><option value="Dec 19">Dec 19 (Fri)</option><option value="Dec 20">Dec 20 (Sat)</option><option value="Dec 21">Dec 21 (Sun)</option><option value="Dec 22">Dec 22 (Mon)</option></select>
<button type="submit" class="btn">Book Now</button>
</form>
<div class="msg" id="bookMsg"></div>
</div>
</div>
<div class="ft">&copy;2026 Light–Matter Interaction Research Group, Xiamen University</div>
<script>
var ROOMS = ${roomData};
var DATES = ["Dec 17","Dec 18","Dec 19","Dec 20","Dec 21","Dec 22"];
buildTable();
function buildTable() {
  var t = document.getElementById("roomTable"), s = document.getElementById("roomType"), h = "";
  h += '<div style="overflow-x:auto"><table><tr><th>Room Type</th><th>Price (MYR/night)</th>';
  for (var d = 0; d < DATES.length; d++) h += "<th>" + DATES[d] + "</th>";
  h += "</tr>";
  var opts = "";
  for (var i = 0; i < ROOMS.length; i++) {
    var r = ROOMS[i], total = 0;
    h += "<tr><td style='font-weight:700;text-align:left'>" + r.type + "</td><td>" + r.price + "</td>";
    for (var d = 0; d < DATES.length; d++) {
      var v = r.daily[DATES[d]] || 0;
      total += v;
      h += "<td class='" + (v > 0 ? "avail" : "full") + "'>" + v + "</td>";
    }
    h += "</tr>";
    if (total > 0) opts += '<option value="' + r.type + '">' + r.type + ' – RM ' + r.price + '/night</option>';
    else opts += '<option disabled>' + r.type + ' – SOLD OUT</option>';
  }
  h += "</table></div>";
  t.innerHTML = h;
  s.innerHTML = opts;
}
document.getElementById("bookForm").addEventListener("submit", function(e) {
  e.preventDefault();
  var bt = this.querySelector("button"), msg = document.getElementById("bookMsg");
  bt.disabled = true; bt.textContent = "Booking...";
  var fd = new FormData();
  fd.append("room", document.getElementById("roomType").value);
  fd.append("name", document.getElementById("guestName").value);
  fd.append("email", document.getElementById("guestEmail").value);
  fd.append("checkin", document.getElementById("checkin").value);
  fd.append("checkout", document.getElementById("checkout").value);
  fetch("?action=book", { method: "POST", body: fd })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success) {
        msg.innerHTML = '<div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;padding:20px;margin-top:8px;"><p style="color:#155724;font-size:18px;font-weight:700;margin:0 0 12px;">&#10003; Booking Successful!</p><p style="color:#155724;font-size:14px;margin:0 0 16px;">A confirmation email will be sent to you shortly.</p><a href="https://photonics.xmu.edu.cn/" style="display:inline-block;background:#122E66;color:#fff;padding:10px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;">&#8592; Back to Symposium Website</a></div>';
      } else {
        msg.innerHTML = '<span style="color:#dc3545;">' + d.message + "</span>";
        bt.disabled = false; bt.textContent = "Book Now";
      }
    })
    .catch(function() {
      msg.innerHTML = '<span style="color:#dc3545;">Network error. Please try again.</span>';
      bt.disabled = false; bt.textContent = "Book Now";
    });
});
</script>
</body><script>document.querySelector(".tbl").addEventListener("click",function(e){var a=e.target.closest(".del-btn");if(!a)return;e.preventDefault();if(!confirm("Delete this booking and restore room count?"))return;var fd=new FormData();fd.append("id",a.dataset.id);fetch("?action=delete",{method:"POST",body:fd}).then(function(r){return r.json()}).then(function(d){alert(d.message);location.reload()}).catch(function(){alert("Delete failed.")})});</script></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function handleAvailability(env, cors) {
  const dates = ["Dec 17", "Dec 18", "Dec 19", "Dec 20", "Dec 21", "Dec 22"];
  const { results } = await env.DB.prepare("SELECT type, price, date_key, available FROM rooms ORDER BY id").all();
  const roomMap = {};
  for (const r of results) {
    if (!roomMap[r.type]) roomMap[r.type] = { type: r.type, price: r.price, daily: {} };
    roomMap[r.type].daily[r.date_key] = r.available;
  }
  return json({ dates, rooms: Object.values(roomMap) }, 200, cors);
}

async function handleBook(request, env, cors) {
  const fd = await request.formData();
  const room = (fd.get("room") || "").trim();
  const name = (fd.get("name") || "").trim();
  const email = (fd.get("email") || "").trim();
  const checkin = (fd.get("checkin") || "").trim();
  const checkout = (fd.get("checkout") || "").trim();
  if (!room || !name || !email || !checkin || !checkout) {
    return json({ success: false, message: "All fields are required" }, 400, cors);
  }
  const ci = checkin, co = checkout;
  const dateOrder = ["Dec 17", "Dec 18", "Dec 19", "Dec 20", "Dec 21", "Dec 22"];
  const si = dateOrder.indexOf(ci), ei = dateOrder.indexOf(co);
  if (si === -1 || ei === -1 || si >= ei) return json({ success: false, message: "Invalid dates" }, 400, cors);
  const nights = dateOrder.slice(si, ei);
  for (const d of nights) {
    const row = await env.DB.prepare("SELECT available FROM rooms WHERE type = ? AND date_key = ?").bind(room, d).first();
    if (!row || row.available <= 0) return json({ success: false, message: `No availability for ${d}` }, 400, cors);
  }
  for (const d of nights) {
    await env.DB.prepare("UPDATE rooms SET available = available - 1 WHERE type = ? AND date_key = ? AND available > 0").bind(room, d).run();
  }
  await env.DB.prepare("INSERT INTO bookings (room, name, email, checkin, checkout, nights, time) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(room, name, email, ci, co, nights.join(","), new Date().toISOString()).run();

  // Email via Resend
  const nl = nights.join(", ");
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_KEY}` },
    body: JSON.stringify({
      from: "Hotel Booking <noreply@xmu-lmi.xyz>",
      to: NOTIFY_EMAIL,
      subject: `[Hotel Booking] ${name} - ${room}`,
      html: `<h3>New Hotel Booking</h3>
        <p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p>
        <p><b>Room:</b> ${room}</p><p><b>Check-in:</b> ${ci}</p>
        <p><b>Check-out:</b> ${co}</p><p><b>Nights:</b> ${nl}</p>`
    }),
  }).catch(() => {});

  return json({ success: true, message: "Booking confirmed!" }, 200, cors);
}

async function handleDelete(request, env, cors) {
  const fd = await request.formData();
  const id = parseInt(fd.get("id") || "0");
  if (!id) return json({ success: false, message: "Missing booking ID" }, 400, cors);
  const booking = await env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first();
  if (!booking) return json({ success: false, message: "Booking not found" }, 404, cors);
  const nights = (booking.nights || "").split(",").filter(Boolean);
  for (const d of nights) {
    await env.DB.prepare("UPDATE rooms SET available = available + 1 WHERE type = ? AND date_key = ?").bind(booking.room, d).run();
  }
  await env.DB.prepare("DELETE FROM bookings WHERE id = ?").bind(id).run();
  return json({ success: true, message: "Booking deleted, rooms restored." }, 200, cors);
}
async function handleReset(env, cors) {
  await env.DB.prepare("DELETE FROM bookings").run();
  await env.DB.prepare("UPDATE rooms SET available = 8 WHERE type = '(a) Deluxe Suite'").run();
  await env.DB.prepare("UPDATE rooms SET available = 18 WHERE type = '(b) Deluxe King'").run();
  await env.DB.prepare("UPDATE rooms SET available = 36 WHERE type = '(c) Standard King'").run();
  await env.DB.prepare("UPDATE rooms SET available = 72 WHERE type = '(d) Standard Twin'").run();
  return json({ success: true, message: "All bookings cleared, rooms reset." }, 200, cors);
}
async function handleBookings(env, cors, fmt) {
  if (fmt === "csv") return await handleBookingsCSV(env, cors);
  const { results } = await env.DB.prepare("SELECT * FROM bookings ORDER BY id DESC LIMIT 100").all();
  let rows = "";
  if (results.length === 0) {
    rows = '<tr><td colspan="8" style="text-align:center;padding:60px;color:#ccc;font-size:40px;">&#128236;<br><span style="font-size:16px;">No bookings yet</span><br><a href="#" onclick="if(confirm(&quot;Clear ALL bookings and reset room availability? This cannot be undone.&quot;)){fetch(&quot;?action=reset&quot;,{method:&quot;POST&quot;}).then(function(r){return r.json()}).then(function(d){alert(d.message);location.reload();}).catch(function(){alert(&quot;Reset failed.&quot;)});}return false;" style="color:rgba(255,255,255,.5);text-decoration:none;font-size:13px;">&#8635; Refresh</a></td></tr>';
  } else {
    for (const b of results) {
      const n = b.nights ? b.nights.split(",").length : 1;
      const t = b.time ? new Date(b.time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
      const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      rows += `<tr>
        <td><strong style="color:#122E66">${esc(b.name)}</strong></td>
        <td style="color:#999;font-size:13px">${esc(b.email)}</td>
        <td>${esc(b.room)}</td>
        <td style="text-align:center;font-weight:600;color:#122E66">${n}</td>
        <td style="text-align:center">${esc(b.checkin)}</td>
        <td style="text-align:center">${esc(b.checkout)}</td>
        <td style="color:#999;font-size:12px">${t}</td>
        <td style="text-align:center"><a href="#" class="del-btn" data-id="${b.id}" style="color:#dc3545;text-decoration:none;font-weight:700;font-size:18px;" title="Delete">&times;</a></td>
      </tr>`;
    }
  }
  const html = `<!doctype html><html lang="en-US"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hotel Bookings \u2013 5th XMU Symposium</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:linear-gradient(135deg,#122E66 0%,#1a3f7c 100%);min-height:100vh;padding:30px 20px}.card{max-width:1100px;margin:0 auto}.hdr{text-align:center;margin-bottom:28px}.hdr h1{color:#fff;font-size:28px;font-weight:700}.hdr p{color:rgba(255,255,255,.65);font-size:13px;margin-top:4px}.tbl{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.25)}table{width:100%;border-collapse:collapse}thead th{background:#122E66;color:#fff;padding:14px 18px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;text-align:left}thead th.c{text-align:center}tbody td{padding:16px 18px;border-bottom:1px solid #f2f2f2;font-size:14px}tbody tr:last-child td{border:none}tbody tr:hover{background:#f6f9ff}.ft{text-align:center;margin-top:16px;color:rgba(255,255,255,.45);font-size:12px}.ft a{color:rgba(255,255,255,.6);text-decoration:none}@media (max-width:768px){
  body{font-size:15px}
  .c{padding:12px}
  .hdr{padding:20px 14px;margin-bottom:16px;border-radius:0 0 8px 8px}
  .hdr h1{font-size:18px}
  .hdr p{font-size:12px}
  .card{padding:18px 14px;margin-bottom:14px;border-radius:8px}
  .card h2{font-size:16px;margin-bottom:12px}
  table{font-size:11px}
  th,td{padding:6px 8px}
  input,select{padding:14px 12px;font-size:16px;background-position:right 10px center;padding-right:32px}
  .btn{padding:16px;font-size:18px}
  .msg{font-size:14px}
}
</style></head>
<body><div class="card"><div class="hdr"><h1>&#127968; Hotel Bookings</h1><p>5th XMU Symposium on Light\u2013Matter Interactions in Nanostructures</p></div><div class="tbl"><table><thead><tr><th>Name</th><th>Email</th><th>Room Type</th><th class="c">Nights</th><th class="c">Check-in</th><th class="c">Check-out</th><th>Booked</th><th class="c" style="width:40px">Del</th></tr></thead><tbody>${rows}</tbody></table></div><div class="ft">${results.length} booking(s) &middot; <a href="#" onclick="if(confirm(&quot;Clear ALL bookings and reset room availability? This cannot be undone.&quot;)){fetch(&quot;?action=reset&quot;,{method:&quot;POST&quot;}).then(function(r){return r.json()}).then(function(d){alert(d.message);location.reload();}).catch(function(){alert(&quot;Reset failed.&quot;)});}return false;" style="color:rgba(255,255,255,.6);text-decoration:none">&#8635; Refresh</a> &middot; <a href="?action=bookings&format=csv" style="color:rgba(255,255,255,.6);text-decoration:none">&#128229; Export CSV</a></div></div></body><script>document.querySelector(".tbl").addEventListener("click",function(e){var a=e.target.closest(".del-btn");if(!a)return;e.preventDefault();if(!confirm("Delete this booking and restore room count?"))return;var fd=new FormData();fd.append("id",a.dataset.id);fetch("?action=delete",{method:"POST",body:fd}).then(function(r){return r.json()}).then(function(d){alert(d.message);location.reload()}).catch(function(){alert("Delete failed.")})});</script></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", ...cors } });
}

async function handleBookingsCSV(env, cors) {
  const { results } = await env.DB.prepare("SELECT name, email, room, checkin, checkout, nights, time FROM bookings ORDER BY id DESC").all();
  let csv = "Name,Email,Room,Check-in,Check-out,Nights,Time\n";
  for (const b of results) {
    const n = b.nights ? b.nights.split(",").length : 1;
    csv += `"${b.name}","${b.email}","${b.room}","${b.checkin}","${b.checkout}",${n},"${b.time || ""}"\n`;
  }
  return new Response(csv, {
    status: 200,
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=bookings.csv", ...cors },
  });
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors } });
}