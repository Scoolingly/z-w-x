const x=require("crypto"),{y}=require("mongodb"),a1=process.env.X1,a2=process.env.X2,b1=process.env.X3,b2=process.env.X4,c1=process.env.Y1,c2=process.env.Y2,c3=process.env.Y3,d1=JSON.parse(process.env.Y4);let p1=null,p2=0,p3=!1,p4=null;const e1=process.env.Z1,h1=process.env.H1;if(!e1)console.error("Error occurred: 101"),process.exit(1);const f1=async()=>p4||(p4=new y(c1,{useNewUrlParser:!0,useUnifiedTopology:!0}),await p4.connect()),f2=async()=>{if(p3)return;p3=!0;try{const t1=Math.floor(Date.now()/1e3),t2=x.createHash("md5").update(x.createHash("md5").update(a1).digest("hex")+t1).digest("hex"),r1=await fetch(`${e1}/z9?m1=${t1}&m2=${a2}&m3=${t2}`);if(!r1.ok)throw new Error(`Error occurred: ${r1.status}`);const d2=await r1.json();if(0===d2.a&&d2.b?.c){p1=d2.b,p2=(t1+d2.b.d)*1e3;const col=await f1();await col.updateOne({},{$set:{e:p1.c,f:p2}},{upsert:!0})}else throw new Error("Error occurred: 201")}catch(e){}finally{p3=!1}},f3=async()=>{if(p1&&Date.now()<p2)return p1;try{const col=await f1(),t3=await col.findOne({});return t3&&t3.e&&Date.now()<t3.f?(p1={c:t3.e,d:Math.floor((t3.f-Date.now())/1e3)},p2=t3.f,p1):(await f2(),await f3())}catch(e){throw new Error("Error occurred: 301")}},f4=async(q1,q2,q3)=>{try{const t4=await f3();if(!t4)throw new Error("Error occurred: 401");const r2=await fetch(`${e1}/y8?k1=${t4.c}&k2=${q1}&k3=${q2}&k4=${q3}`);if(!r2.ok)throw new Error(`Error occurred: ${r2.status}`);const d3=await r2.json();return 0===d3.a&&d3.b?d3.b.split(";").reduce((r3,_,i,arr)=>(i%8==0&&arr[i]&&r3.push({x1:arr[i],x2:arr[i+1],x3:arr[i+2],x4:arr[i+3],x5:arr[i+4],x6:arr[i+5],x7:arr[i+6],x8:arr[i+7]}),r3),[]):[]}catch(e){return[]}},f5=async(s1,s2)=>{try{const p5={interests:[`a_${s1}`],fcm:{notification:{title:"Alert",body:`Type: ${s2.x1}, ID: ${s1}, Time: ${s2.x4}`},data:s2}},url=`https://${b1}.${h1}/api/v1/z7/${b1}`,r3=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b2}`},body:JSON.stringify(p5)});if(!r3.ok)throw new Error(`Error occurred: ${r3.status}`)}catch(e){}},f6=async t5=>{const t6=Math.floor(Date.now()/1e3),t7=parseInt(process.env.Z2||"180"),t8=t6-t7,r4=await f4(t5,t8,t6);if(!r4.length)return;const t9=r4.filter(a=>a&&("5"===a.x1||"6"===a.x1)).map(a=>f5(a.x8,a));await Promise.all(t9)},f7=async()=>{await Promise.all(d1.map(i=>f6(i)))};(async()=>{await f7(),p4&&await p4.close()})();
