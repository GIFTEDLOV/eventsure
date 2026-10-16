/** Defense-in-depth response headers. */
const securityHeaders=[
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
  {key:"Strict-Transport-Security",value:"max-age=31536000; includeSubDomains"}
];
export default {
  turbopack:{root:process.cwd()},
  async headers(){return [{source:"/(.*)",headers:securityHeaders}]}
};

