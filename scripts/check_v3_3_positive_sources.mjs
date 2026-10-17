const urls=[
  "https://www.nasa.gov/centers-and-facilities/kennedy/50-years-ago-apollo-astronauts-land-take-first-steps-on-moon/",
  "https://airandspace.si.edu/explore/stories/apollo-missions/apollo-11-moon-landing/apollo-11-timeline"
];
for(const url of urls){
 const res=await fetch(url,{headers:{"user-agent":"Mozilla/5.0 (compatible; EventSureV33EvidenceCheck/1.0)"}});
 if(!res.ok)throw Error("Source not accessible: "+new URL(url).host+" HTTP "+res.status);
 const bytes=Buffer.from(await res.arrayBuffer());
 console.log(JSON.stringify({host:new URL(url).host,http:res.status,bytes:bytes.length,containsApollo11:/Apollo\s*11/i.test(bytes.toString()),contains1969:/1969/.test(bytes.toString())}));
 if(bytes.length>500000)throw Error("Source too large for GenVM 500KB cap: "+url);
 if(!/1969/.test(bytes.toString()))throw Error("Missing historical date: "+url);
 if(!/Apollo\s*11/i.test(bytes.toString()))throw Error("Missing Apollo 11 reference: "+url);
}
console.log("EVENTSURE_V33_POSITIVE_SOURCE_PREFLIGHT=PASS");
