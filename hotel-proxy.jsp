<%@ page contentType="application/json;charset=UTF-8" 
    import="java.io.*,java.net.*" %>
<%
  String action = request.getParameter("action");
  String workerUrl = "https://hotel-booking.xmu-hotel.workers.dev?action=" + action;
  
  URL url = new URL(workerUrl);
  HttpURLConnection conn = (HttpURLConnection) url.openConnection();
  conn.setRequestMethod(request.getMethod());
  
  if ("POST".equalsIgnoreCase(request.getMethod())) {
    conn.setDoOutput(true);
    conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
    // Forward POST body
    BufferedReader bodyReader = request.getReader();
    StringBuilder body = new StringBuilder();
    String line;
    while ((line = bodyReader.readLine()) != null) body.append(line);
    OutputStream os = conn.getOutputStream();
    os.write(body.toString().getBytes("UTF-8"));
    os.flush();
  }
  
  // Read response
  BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
  StringBuilder responseStr = new StringBuilder();
  String respLine;
  while ((respLine = reader.readLine()) != null) responseStr.append(respLine);
  reader.close();
  conn.disconnect();
  
  out.print(responseStr.toString());
%>
