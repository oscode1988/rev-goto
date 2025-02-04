import { NextRequest } from "next/server";

const pickHeaders = (headers: Headers, keys: (string | RegExp)[]): Headers => {
  const picked = new Headers();
  for (const key of headers.keys()) {
    if (keys.some((k) => (typeof k === "string" ? k === key : k.test(key)))) {
      const value = headers.get(key);
      if (typeof value === "string") {
        picked.set(key, value);
      }
    }
  }
  return picked;
};

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type",
};

export default async function handleRequest(request: NextRequest & { nextUrl?: URL }) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }


  const { pathname, searchParams } = request.nextUrl ? request.nextUrl : new URL(request.url);

  // curl \
  // -H 'Content-Type: application/json' \
  // -d '{ "prompt": { "text": "Write a story about a magic backpack"} }' \
  // "https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key={YOUR_KEY}"

  const acurl = pathname.replace("/_gohttps_/","https://").replace("/_gohttp_/","https://")

  const url = new URL(acurl)

  searchParams.delete("_path");

  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });



  const headers = pickHeaders(request.headers, ["content-type","user-agent","accept","accept-encoding","accept-language","upgrade-insecure-requests"]);

  const response = await fetch(url, {
    body: request.body,
    method: request.method,
    headers,
    redirect: 'follow'
  });

  const responseHeaders = {
    ...CORS_HEADERS,
    ...Object.fromEntries(
      // pickHeaders(response.headers, ["content-type","user-agent"])
      response.headers
    ),
  };

  return new Response(response.body, {
    headers: responseHeaders,
    status: response.status
  });
}
