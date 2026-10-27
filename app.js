/* Cedar Exchange — offline educational market simulator, prototype 0.2.
   Fictional values and simplified pricing. No network or financial transactions. */
(() => {
  'use strict';
  const STORE = 'cedar-exchange-prototype-01';
  const STARTING_CASH = 10000;
  const COMPANY_SEEDS = [
    {ticker:'HARB', name:'Harborlight Coffee', sector:'Consumer discretionary', category:'Growth', icon:'☕',price:24.50,eps:1.20,pe:20.42,growth:0.12, margin:9.2,debt:42, volatility:1.25,cyclical:1.05,description:'An expanding coffee chain balancing new-store growth against rising staffing and rent costs.', strength:'Recognizable regional brand and loyal regular customers.',risk:'New stores require cash and can take years to become profitable.'},
    {ticker:'SLVR', name:'Silverstone Electronics', sector:'Technology', category:'Growth', icon:'▣',price:48.20,eps:1.70,pe:28.35,growth:0.18,margin:13.5,debt:31,volatility:1.60,cyclical:1.25,description:'A consumer-electronics company competing on design, engineering, and product launches.',strength:'Strong research team and popular flagship devices.',risk:'Product delays or weak launches can quickly change expectations.'},
    {ticker:'EDGR', name:'Everyday Grocers', sector:'Consumer staples', category:'Defensive',icon:'▤',price:36,eps:3.10,pe:11.61,growth:0.035,margin:5.1,debt:26,volatility:0.66,cyclical:0.22,description:'A large neighborhood grocery chain focused on essential products and low prices.',strength:'Customers need essentials even when budgets tighten.',risk:'Thin margins, high labor costs, and intense price competition.'},
    {ticker:'MPE',name:'Mountain Peak Energy',sector:'Energy',category:'Cyclical',icon:'⚡',price:62.80,eps:5.40,pe:11.63,growth:0.055,margin:16.7,debt:48,volatility:1.35,cyclical:1.4,description:'An independent energy producer exposed to fuel prices, production costs, and industrial demand.',strength:'Established production sites and valuable infrastructure.',risk:'Commodity prices and outages can overwhelm otherwise solid results.'},
    {ticker:'PRDS',name:'Paradise Resorts',sector:'Travel & leisure',category:'Cyclical',icon:'☼',price:18.75,eps:1.10,pe:17.05,growth:0.085,margin:11.1,debt:62,volatility:1.60,cyclical:1.7,description:'A luxury resort operator dependent on travel demand and discretionary spending.',strength:'Premium locations and a loyal repeat-guest program.',risk:'Travel slowdowns and substantial property debt.'},
    {ticker:'NTHC',name:'Northstar Healthcare',sector:'Healthcare',category:'Defensive',icon:'✚',price:41.30,eps:2.50,pe:16.52,growth:0.06,margin:8.7,debt:39,volatility:0.85,cyclical:0.32,description:'A regional hospital and medical-services operator serving several growing communities.',strength:'Continuing demand for essential medical services.',risk:'Wage inflation, changing reimbursements, and regulation.'}
  ];
  const PRESET_EVENTS = {
    2:{ticker:'HARB', impact:-0.08, priceShock:-0.025, mood:0.08,headline:'Harborlight revenue rises 20%; operating profit falls 8% as expansion costs mount',detail:'Growth in sales is positive, but opening new shops is expensive. The market weighs future potential against weaker profit today.',official:'Quarterly update: revenue +20% and operating profit −8% as we build out new locations.',question:'Does higher revenue necessarily mean higher profit? Compare expansion costs with long-term growth potential.'},
    3:{ticker:'EDGR',impact:0.025,priceShock:0.012,mood:0.04,headline:'Everyday Grocers reports steady demand for household essentials',detail:'Customers continue buying food and necessities. Defensive does not mean risk-free.',official:'Our latest quarter showed resilient customer demand and a modest improvement in earnings.',question:'How could consistent demand protect a business during a downturn?'},
    5:{ticker:'PRDS',impact:-0.11,priceShock:-0.05,mood:-0.25,headline:'Paradise Resorts cuts outlook after a wave of canceled bookings',detail:'Vacation spending is sensitive to consumer confidence and economic uncertainty.',official:'Booking cancellations have risen. We have reduced our profit outlook for the current year.',question:'Which kinds of purchases do households delay when money becomes tight?'},
    7:{ticker:'SLVR',impact:0.07,priceShock:0.032,mood:0.2,headline:'Silverstone unveils stronger-than-expected advance orders for new device',detail:'Preorders can be encouraging, but fulfillment costs and customer returns still matter.',official:'Preorders for our new device exceeded our internal forecast. Deliveries begin next month.',question:'Are preorders the same as earned profit? What might still go wrong?'},
    9:{ticker:'MPE',impact:-0.09,priceShock:-0.04,mood:-0.16,headline:'Equipment failure forces temporary shutdown at Mountain Peak facility',detail:'An operational problem can damage profits even when demand remains strong.',official:'An equipment fault has halted one production facility. Repairs are underway.',question:'Would you investigate how much of company output that facility represents?'},
    12:{ticker:'HARB',impact:0.08,priceShock:0.034,mood:0.24,headline:'Harborlight signs high-traffic transit-station partnership',detail:'A deal may raise expected future sales, but investors can overestimate its eventual impact.',official:'We signed a multi-year agreement to open coffee counters at several transit stations.',question:'How would you estimate the new agreement’s impact on earnings?'},
    16:{ticker:'NTHC',impact:-0.065,priceShock:-0.022,mood:-0.10,headline:'Northstar Healthcare warns of higher staffing expenses',detail:'Hospitals may have steady demand but still face financial pressure when expenses climb.',official:'Patient demand remains stable, though higher staffing costs have reduced our earnings forecast.',question:'Why might steady demand fail to protect profit margins?'},
    21:{ticker:'EDGR',impact:0.03,priceShock:0.011,mood:0.07,headline:'Everyday Grocers launches lower-cost house brand',detail:'Improving private-label sales could support margins, but consumers might reject the products.',official:'Our new essentials range will be available across all stores this month.',question:'What evidence would show this launch is helping the business?'},
    28:{ticker:'PRDS',impact:0.075,priceShock:0.028,mood:0.10,headline:'Paradise Resorts bookings rebound following promotional campaign',detail:'An improvement after a slump matters, but investors will assess whether discounts hurt margins.',official:'Room bookings have improved after our seasonal promotional campaign.',question:'Can higher booking volume still come with disappointing profit?'}
  };
  const $ = id => document.getElementById(id);
  const ui = {chartTicker:'HARB',view:'dashboard',company:'HARB',postId:null,postFilter:'all',marketFilter:'all',tradeTicker:null,tradeSide:'buy',autoTimer:null,speed:'slow',toastTimer:null,orderType:'market',eventAlert:null,tradeQty:1};
  const money = n => (n<0?'−':'')+'$'+Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const pct = (n,d=2) => (n>=0?'+':'−')+Math.abs(n*100).toFixed(d)+'%';
  const signed = n => `<span class="${n>0.000001?'pos':n<-.000001?'neg':'neutral'}">${pct(n)}</span>`;
  const round = (n,d=2) => Math.round(n*Math.pow(10,d))/Math.pow(10,d);
  const escapeHtml = t => String(t??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const company = t => state.companies.find(c=>c.ticker===t);
  const startup = () => ({version:1, rng:91371823, day:1,cash:STARTING_CASH,realized:0,holdings:{},watchlist:['HARB','EDGR'],companies:COMPANY_SEEDS.map(s=>({...s,history:[s.price],previous:s.price,change:0,sentiment:0,priceReason:'The exchange has just opened. Study companies before deciding to trade.'})),news:[],posts:[],trades:[],macro:{confidence:53,inflation:2.4,rate:3.8},postSeq:1,minuteOfDay:0,orders:[],orderSeq:1,dayOpeningEquity:STARTING_CASH,dayOpeningPrices:{},lastEvent:null,liveTrace:[],previousTrace:[]});
  let state;
  try {const raw=localStorage.getItem(STORE);const parsed=raw?JSON.parse(raw):null;state=parsed?.version===1 && Array.isArray(parsed.companies) && parsed.companies.length===6?parsed:startup();} catch {state=startup();}
  // Migrate existing version-1 browser saves in place: never reset cash, holdings or histories.
  state.minuteOfDay=Number.isFinite(state.minuteOfDay)?state.minuteOfDay:0;
  state.orders=Array.isArray(state.orders)?state.orders:[];
  state.orderSeq=state.orderSeq||1;
  state.dayOpeningEquity=Number.isFinite(state.dayOpeningEquity)?state.dayOpeningEquity:getEquityInitial();
  state.dayOpeningPrices=state.dayOpeningPrices||{};
  // Track actual exposure over the day; an intraday purchase must not inherit earlier gains.
  state.dailyStockPnl=state.dailyStockPnl||{};
  for(const c of state.companies){if(!Number.isFinite(c.prevClose))c.prevClose=c.price;if(!Number.isFinite(c.eventImpulse))c.eventImpulse=0;if(!state.dayOpeningPrices[c.ticker])state.dayOpeningPrices[c.ticker]=c.price;}
  function getEquityInitial(){return state.cash+Object.entries(state.holdings).reduce((v,[t,h])=>v+h.qty*(state.companies.find(c=>c.ticker===t)?.price||0),0);}
  const tradingDay = () => ((state.day-1)%7)<5;
  const openNow = () => tradingDay()&&state.minuteOfDay>=570&&state.minuteOfDay<960;
  const timeLabel = (m=state.minuteOfDay) => {let h=Math.floor(m/60)%24;return `${h%12||12}:${String(m%60).padStart(2,'0')} ${h<12?'AM':'PM'}`;};
  const blockName = () => ['Overnight','Morning','Afternoon','Evening'][Math.min(3,Math.floor(Math.min(state.minuteOfDay,1439)/360))];
  const dayChange = () => getEquity()-state.dayOpeningEquity;
  const liveMove = c => (c.price-(state.dayOpeningPrices[c.ticker]||c.price))/(state.dayOpeningPrices[c.ticker]||c.price);
  const actionable = () => ui.autoTimer===null;
  const random = () => {let n=state.rng|0;n ^= n<<13;n ^= n>>>17;n ^= n<<5;state.rng=n>>>0;return (state.rng>>>0)/4294967296;};
  const randomBetween = (a,b) => a+(b-a)*random();
  const save = () => {try {localStorage.setItem(STORE,JSON.stringify(state));} catch { /* private browsing: play without persistence */ }};
  const addNews = (ticker,title,detail) => {state.news.unshift({day:state.day,ticker,title,detail});state.news=state.news.slice(0,40)};
  const post = (author,handle,avatar,ticker,body,kind,truth,check,likes=24,verified=false) => {state.posts.unshift({id:state.postSeq++,day:state.day,author,handle,avatar,ticker,body,kind,truth,check,likes,comments:Math.floor(likes*.18),verified});state.posts=state.posts.slice(0,100)};
  const startupFeed = () => {
    addNews('MARKET','Cedar Exchange launches with six publicly traded fictional companies','Explore their financials, read investor commentary, and decide how to allocate your $10,000 starting cash.');
    post('Harborlight Coffee','@HarborlightOfficial','☕','HARB','We are evaluating several new locations. Any expansion will have startup expenses as well as potential for new revenue.','Company statement','The official account confirms expansion is being considered, not guaranteed. A company statement is evidence of its stated plans, not proof that those plans will succeed.','Compare future announcements with Harborlight’s earnings per share and operating margin.',143,true);
    post('RocketRicky','@RickyTrades','🚀','HARB','HARB is the NEXT GIANT. $100 a share is practically guaranteed. Don’t be the last one in!','Unsubstantiated price prediction','Ricky makes a confident prediction without presenting earnings, valuation, or assumptions. Popularity is not proof.','Check the company’s current share price and earnings per share. Ask what would justify the predicted price.',850);
    post('CoffeeWithMaya','@MayaMorning','☕','HARB','My local Harborlight seems busier every week. They even added another morning shift.','Customer observation','This may be an honest observation, but one location is not a reliable measure of company-wide profitability.','Look for evidence across more locations and compare reported revenue with costs.',86);
    post('Ellis Ward, CFA','@EllisEvaluates','📊','EDGR','Steady grocery demand does not automatically make EDGR a bargain. The price we pay matters as much as the company we buy.','Analyst opinion','This is a reasoned general point about valuation, not proof the stock is undervalued or overpriced. The CFA letters are fictional in this game.','Compare price-to-earnings ratios and risks across companies.',112);
  };
  if (!state.posts.length) startupFeed();
  const navLabel = {dashboard:'My Money',market:'Live Market',pulse:'MarketPulse',portfolio:'Trade History',academy:'Field Guide'};
  const getEquity = () => state.cash+Object.entries(state.holdings).reduce((v,[t,h])=>v+h.qty*company(t).price,0);
  state.liveTrace=Array.isArray(state.liveTrace)?state.liveTrace:[];
  state.previousTrace=Array.isArray(state.previousTrace)?state.previousTrace:[];
  if(!state.liveTrace.length)state.liveTrace=[{day:state.day,minute:570,equity:state.dayOpeningEquity,prices:{...state.dayOpeningPrices}}];
  const invested = () => getEquity()-state.cash;
  const unrealized = () => Object.entries(state.holdings).reduce((v,[t,h])=>v+(company(t).price-h.avg)*h.qty,0);
  const exposure = () => Object.values(state.holdings).reduce((v,h)=>v+h.qty,0);
  const economy = () => state.macro.confidence<42?'Cautious economy':state.macro.confidence>62?'Optimistic economy':'Balanced economy';
  const portfolioDelta = () => getEquity()-STARTING_CASH;
  function sparkline(values, color='#60dfae',height=32,width=100) {
    const a=values.length>1?values:[values[0],values[0]];const min=Math.min(...a),max=Math.max(...a);const span=Math.max(max-min,.001);
    const path=a.map((v,i)=>`${(i/(a.length-1)*width).toFixed(1)},${(height-4-((v-min)/span)*(height-8)).toFixed(1)}`).join(' ');
    return `<svg class="mini-spark" viewBox="0 0 ${width} ${height}" aria-hidden="true"><polyline points="${path}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function lineChart(c) {
    const a=c.history.length>1?c.history:[c.price,c.price];const low=Math.min(...a)*.985,high=Math.max(...a)*1.015,range=Math.max(.1,high-low);const w=760,h=188;
    const pts=a.map((v,i)=>`${(i/(a.length-1)*w).toFixed(1)},${(h-14-(v-low)/range*(h-28)).toFixed(1)}`).join(' ');
    const color=c.history.length>1&&c.price<c.history[0]?'#fb7e8a':'#60dfae';
    return `<svg role="img" aria-label="Historical fictional prices for ${c.name}, ${a.length} days" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line x1="0" y1="47" x2="760" y2="47" stroke="#263c50" stroke-dasharray="4 7"/><line x1="0" y1="94" x2="760" y2="94" stroke="#263c50" stroke-dasharray="4 7"/><line x1="0" y1="141" x2="760" y2="141" stroke="#263c50" stroke-dasharray="4 7"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  }
  const pill = c=>`<span class="pill ${c.category==='Cyclical'?'warn':c.category==='Growth'?'blue':''}">${c.category}</span>`;
  function sectionIntro(label,title,desc){return `<div class="kicker"><span class="tiny-bar"></span>${label}</div><h1 class="page-heading">${title}</h1><p class="page-sub">${desc}</p>`}

  // Visual price and wealth history: an optional layer over the existing 0.2 market engine.
  function snapshotTrace() {
    const point={day:state.day,minute:state.minuteOfDay,equity:round(getEquity()),prices:Object.fromEntries(state.companies.map(c=>[c.ticker,c.price]))};
    if(!Array.isArray(state.liveTrace))state.liveTrace=[];
    if(state.liveTrace.length&&state.liveTrace[state.liveTrace.length-1].minute===point.minute)state.liveTrace[state.liveTrace.length-1]=point;
    else state.liveTrace.push(point);
    if(state.liveTrace.length>45)state.liveTrace.shift();
  }
  function traceHistory(){
    if(state.liveTrace&&state.liveTrace.length>1)return {points:state.liveTrace,old:false};
    if(state.previousTrace&&state.previousTrace.length>1)return {points:state.previousTrace,old:true};
    return {points:state.liveTrace||[],old:false};
  }
  function liveGraph(mode){
    const isStock=mode==='market',c=company(ui.chartTicker)||state.companies[0];
    const t=traceHistory();
    const values=t.points.map(p=>isStock?(p.prices&&p.prices[c.ticker])||c.price:p.equity);
    if(!values.length)values.push(isStock?c.price:getEquity());
    if(values.length===1)values.push(values[0]);
    const base=values[0],end=values[values.length-1],gain=end-base;
    const min=Math.min(...values),max=Math.max(...values),spread=Math.max(.05,max-min,base*.0005),low=min-spread*.25,high=max+spread*.25;
    const xx=i=>32+i/(values.length-1)*704, yy=v=>197-(v-low)/(high-low)*171;
    const pts=values.map((v,i)=>[xx(i),yy(v)]);
    const path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const last=pts[pts.length-1],first=pts[0],color=gain>=0?'#60dfae':'#fb7e8a',ident=isStock?'marketgraphfill':'wealthgraphfill';
    const area=path+' L '+last[0].toFixed(1)+' 203 L '+first[0].toFixed(1)+' 203 Z';
    const guides=[52,110,168].map(y=>'<line x1="32" y1="'+y+'" x2="736" y2="'+y+'" stroke="#4b6177" stroke-opacity=".3" stroke-dasharray="3 7"/>').join('');
    const svg='<svg class="live-plot" role="img" aria-label="'+escapeHtml(isStock?'Intraday price chart for '+c.name:'Intraday value chart for your portfolio')+'" viewBox="0 0 768 224" preserveAspectRatio="none"><defs><linearGradient id="'+ident+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+color+'" stop-opacity=".27"/><stop offset="100%" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs>'+guides+'<path d="'+area+'" fill="url(#'+ident+')"/><path d="'+path+'" stroke="'+color+'" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="5" fill="'+color+'" stroke="#081323" stroke-width="2"/><text x="32" y="220" fill="#9db1c5" font-size="12">9:30 AM</text><text x="736" y="220" text-anchor="end" fill="#9db1c5" font-size="12">'+(t.old?'Prior close':timeLabel(Math.max(570,Math.min(960,state.minuteOfDay))))+'</text></svg>';
    const tickerPicker=isStock?'<label class="graph-picker">Watch: <select id="chartTicker" aria-label="Choose a stock chart">'+state.companies.map(x=>'<option value="'+x.ticker+'" '+(c.ticker===x.ticker?'selected':'')+'>'+escapeHtml(x.name)+'</option>').join('')+'</select></label>':'<span class="graph-desc">CASH + ALL YOUR SHARES</span>';
    const status=ui.autoTimer&&openNow()?'<span class="plot-live">● LIVE</span>':'<span class="plot-idle">'+(t.old?'PREVIOUS TRADING SESSION':openNow()?'PAUSED':'REGULAR MARKET CLOSED')+'</span>';
    return '<section class="panel trading-graph"><div class="graph-heading"><div><span class="kicker">'+(isStock?'MARKET PRICE IN MOTION':'YOUR WEALTH IN MOTION')+'</span><h2>'+(isStock?escapeHtml(c.name):'Live portfolio value')+'</h2></div>'+status+'</div><div class="graph-meta"><strong class="graph-money">'+money(end)+'</strong><span class="'+(gain>=0?'pos':'neg')+' graph-difference">'+(gain>=0?'+':'−')+money(Math.abs(gain))+' ('+pct(base?gain/base:0)+')</span></div><div class="graph-canvas">'+svg+'</div><div class="graph-bottom">'+tickerPicker+'<span class="graph-note">'+(t.points.length<2?'The chart will begin moving during the next trading session.':t.old?'Previous market session shown until new trading begins.':'New points appear every simulated 15 minutes while trading is open.')+'</span></div></section>';
  }

  const stat=(label,value,sub,extra='')=>`<div class="panel statcard"><div class="stat-label">${label}<span>${extra}</span></div><div class="stat-value">${value}</div><div class="small-desc">${sub}</div></div>`;
  function marketRows(limit=6) {return `<div class="live-market-list">${state.companies.slice(0,limit).map(c=>{const important=Math.abs(liveMove(c))>=.01||c.lastEventDay===state.day;const points=traceHistory().points.map(p=>(p.prices&&p.prices[c.ticker])||c.price);return `<div class="live-company" data-company="${c.ticker}" tabindex="0"><div class="live-company-head"><div class="live-company-title"><span class="big-symbol small">${c.icon}</span><div><strong>${escapeHtml(c.name)}</strong><small>${c.ticker} · ${escapeHtml(c.sector)}</small></div></div><div class="align-r"><strong class="live-price">${money(c.price)}</strong><div>${signed(liveMove(c))} <span class="muted micro">today</span></div></div></div><div class="market-mini-chart">${sparkline(points.length>1?points:c.history.slice(-18),liveMove(c)>=0?"#60dfae":"#fb7e8a",48,260)}</div>${important?`<p class="movement-reason">${escapeHtml(c.priceReason)}</p>`:''}</div>`}).join('')}</div>`;}
  function newsBlock(count=4){return `<div class="panel panel-pad"><div class="section-head"><h2>Market bulletin</h2><span class="pill blue">SIMULATED</span></div>${state.news.slice(0,count).map(n=>`<div class="news-item"><div class="news-meta"><span>${n.ticker}</span> · Day ${n.day}</div><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.detail)}</p></div>`).join('')}</div>`}
  function dashboard(){
    const daily=dayChange(),total=portfolioDelta(),held=Object.entries(state.holdings).filter(([,h])=>h.qty>0);
    return `${sectionIntro('YOUR MONEY','Your financial dashboard','Watch your money change as the market moves. You do not need to trade every session.')}
    <div class="hero-wealth panel"><div class="kicker">TOTAL WEALTH — CASH + SHARES</div><div class="wealth-number">${money(getEquity())}</div><div class="wealth-today ${daily>=0?'pos':'neg'}">${daily>=0?'▲':'▼'} ${money(daily)} ${pct(daily/Math.max(1,state.dayOpeningEquity))} today</div><div class="wealth-foot"><span>Since starting: <b class="${total>=0?'pos':'neg'}">${money(total)} (${pct(total/STARTING_CASH)})</b></span><span>${tradingDay()?'Trading day':'Weekend — regular market closed'}</span></div></div>
    <div class="below-gap">${liveGraph("wealth")}</div>
    <div class="grid two below-gap">${stat('CASH AVAILABLE',money(state.cash),'Money you can use to buy shares','◉')}${stat('VALUE OF YOUR SHARES',money(invested()),`${exposure()} shares currently owned`,'▦')}</div>
    <div class="panel panel-pad below-gap"><div class="section-head"><h2>Your stocks today</h2><button class="tiny-link" data-nav="portfolio">Orders & history →</button></div>${held.length?held.map(([t,h])=>{const c=company(t),mv=state.dailyStockPnl[t]||0;return `<div class="held-line" data-company="${t}"><div><strong>${c.icon} ${escapeHtml(c.name)}</strong><small>${h.qty} shares · ${money(h.qty*c.price)} current value</small></div><div class="align-r ${mv>=0?'pos':'neg'}"><strong>${money(mv)}</strong><small>your shares’ gain/loss today</small></div></div>`}).join(''):'<div class="friendly-empty">You haven’t bought any shares yet. Your $10,000 is safe as cash. Explore the Live Market when you feel curious.</div>'}</div>
    ${state.lastEvent?.day===state.day?`<div class="notice below-gap"><strong>Today’s developing story:</strong> ${escapeHtml(state.lastEvent.headline)} <button class="tiny-link" data-action="viewcompany" data-ticker="${state.lastEvent.ticker}">See company →</button></div>`:''}
    <p class="hint below-gap">Today's change compares your total wealth with its value at the start of the day. Buying shares moves money from cash into investments; it does not create a profit. Figures are fictional.</p>`;
  }
  function market(){return `${sectionIntro('WATCH THE EXCHANGE','Live Market','Prices update while regular trading is open. Big moves come with plain-English explanations.')}
    <div class="panel panel-pad session-banner"><div><strong>${openNow()?'● Regular trading is open':tradingDay()?'◷ Regular trading is closed':'◷ Weekend — market closed'}</strong><p>${tradingDay()?'Regular session: 9:30 AM–4:00 PM Eastern.':'Company stories and social posts can still develop outside weekday trading.'}</p></div><button class="btn btn-ghost" data-nav="dashboard">See my money →</button></div>
    <div class="below-gap">${liveGraph("market")}</div>
    ${marketRows(6)}<div class="below-gap">${newsBlock(2)}</div>
    <p class="hint below-gap">A change in price is not always caused by a headline. If no clear event occurred, we'll say so. Tap a company for more details.</p>`;}
  function companyDetail(){
    const c=company(ui.company)||state.companies[0],owned=state.holdings[c.ticker]?.qty||0;return `${sectionIntro('COMPANY RESEARCH',`<button class="tiny-link" data-nav="market" style="padding-left:0">← Company directory</button>`,'A closer look at the business behind the shares.')}
    <div class="panel panel-pad"><div class="details-heading"><div class="big-symbol">${c.icon}</div><div class="details-title"><h2>${escapeHtml(c.name)}</h2><p>${c.ticker} · ${escapeHtml(c.sector)} · ${c.category}</p></div><div class="align-r"><div class="big-price">${money(c.price)}</div>${signed(c.change)}</div></div><div class="section-head"><div><span class="muted">Simulated price history · ${c.history.length} trading day(s)</span></div><div><button class="btn btn-ghost" data-action="watch" data-ticker="${c.ticker}">${state.watchlist.includes(c.ticker)?'★ Watching':'☆ Watch'}</button> <button class="btn btn-primary" data-action="trade" data-ticker="${c.ticker}">Buy / Sell</button></div></div><div class="chart-holder">${lineChart(c)}</div><p class="hint">${owned?`You own ${owned} share(s). `:''}Latest movement: ${escapeHtml(c.priceReason)}</p></div>
    <div class="grid detail-main below-gap"><div class="grid"><div class="panel panel-pad"><div class="section-head"><h2>Business briefing</h2>${pill(c)}</div><p class="para">${escapeHtml(c.description)}</p><div class="grid two"><div class="notice" style="margin:0"><strong>Business strength</strong><div>${escapeHtml(c.strength)}</div></div><div class="notice" style="margin:0"><strong>What could go wrong</strong><div>${escapeHtml(c.risk)}</div></div></div></div><div class="panel panel-pad"><h2 style="font-size:15px;margin:0 0 10px">What changed the price?</h2><p class="para">${escapeHtml(c.priceReason)}</p><p class="hint">The game models valuation, profit outlook, the economy, investor sentiment, and uncertainty. There is no guaranteed one-to-one relationship between profits and share prices.</p></div></div>
    <div class="panel panel-pad"><div class="section-head"><h2>Financial snapshot</h2><span class="pill blue">FICTIONAL</span></div><div class="fact-grid"><div><span>Annual earnings per share</span><strong>${money(c.eps)}</strong></div><div><span>Price / earnings (P/E)</span><strong>${(c.price/c.eps).toFixed(1)}×</strong></div><div><span>Expected annual growth*</span><strong>${Math.round(c.growth*100)}%</strong></div><div><span>Operating margin</span><strong>${c.margin.toFixed(1)}%</strong></div><div><span>Debt level (simplified)</span><strong>${c.debt}%</strong></div><div><span>Investor sentiment</span><strong>${c.sentiment>0.25?'Optimistic':c.sentiment<-.25?'Concerned':'Mixed'}</strong></div></div><p class="fact-foot">*An uncertain estimate, not a promise. The debt level is a simplified risk indicator, not a standard debt ratio. Figures are invented for education; EPS and margins change as business events unfold.</p><button class="btn btn-ghost" data-nav="pulse" style="margin-top:8px;width:100%">Read investor commentary →</button></div></div>`;
  }
  function postCard(p){return `<article class="panel post-card ${ui.postId===p.id?'selected':''}" data-post="${p.id}" tabindex="0" role="button" aria-label="Investigate post from ${escapeHtml(p.author)}"><div class="post-header"><div class="avatar">${p.avatar}</div><div class="identity"><strong>${escapeHtml(p.author)} ${p.verified?'<span class="verified" title="Verified account identity, not verified claims">✦</span>':''}</strong><small>${escapeHtml(p.handle)} · Day ${p.day} · ${p.ticker}</small></div></div><div class="post-text">${escapeHtml(p.body)}</div><div class="post-footer"><span>♡ ${p.likes.toLocaleString()} &nbsp; ◌ ${p.comments}</span><button tabindex="-1">What does this mean? ↗</button></div></article>`}
  function pulse(){
    const posts=state.posts.filter(p=>ui.postFilter==='all'||(ui.postFilter==='watch'&&state.watchlist.includes(p.ticker))||ui.postFilter===p.ticker);
    const selected=state.posts.find(p=>p.id===ui.postId)||null;
    return `${sectionIntro('THE PUBLIC CONVERSATION','MarketPulse','Posts can be correct, mistaken, biased, or deliberately exaggerated. Verify claims before acting.')}
    <div class="grid market-pulse"><div><div class="tabs" style="margin-top:0"><button class="chip ${ui.postFilter==='all'?'active':''}" data-postfilter="all">All posts</button><button class="chip ${ui.postFilter==='watch'?'active':''}" data-postfilter="watch">★ Watched</button>${state.companies.map(c=>`<button class="chip ${ui.postFilter===c.ticker?'active':''}" data-postfilter="${c.ticker}">${c.ticker}</button>`).join('')}</div>${posts.length?posts.map(postCard).join(''):'<div class="panel empty">No posts match this filter yet. Advance a day or change your selection.</div>'}</div><div class="panel investigate"><div class="kicker">◉ INVESTIGATION DESK</div>${selected?`<h3 style="margin-top:12px">${escapeHtml(selected.author)} · ${selected.ticker}</h3><span class="pill ${selected.kind.includes('prediction')?'warn':''}">${escapeHtml(selected.kind)}</span><h4>IN EVERYDAY ENGLISH</h4><p>${escapeHtml(selected.truth)}</p><h4>WHAT TO KEEP IN MIND</h4><p>${escapeHtml(selected.check)}</p><button class="btn btn-primary" style="width:100%;margin-top:22px" data-action="viewcompany" data-ticker="${selected.ticker}">Check ${selected.ticker} financials →</button>`:'<div class="friendly-empty"><strong>No homework required.</strong><p>Read the posts like real social media. Select one only when you are curious what it means.</p></div>'}</div></div>`;
  }
  function portfolio(){
    const holdings=Object.entries(state.holdings).filter(([,h])=>h.qty>0);return `${sectionIntro('YOUR OWNERSHIP','Portfolio','Buying a share makes you a part-owner of a business. Price movements change what other investors currently pay for that stake.')}
    <div class="grid four portfolio-head">${stat('PORTFOLIO VALUE',money(getEquity()),'Cash + owned shares')}${stat('UNREALIZED GAIN / LOSS',`<span class="${unrealized()>=0?'pos':'neg'}">${money(unrealized())}</span>`,'Changes on shares you still hold')}${stat('REALIZED GAIN / LOSS',`<span class="${state.realized>=0?'pos':'neg'}">${money(state.realized)}</span>`,'From completed sales')}${stat('CASH',money(state.cash),'Available to invest')}</div>
    <div class="panel panel-pad"><div class="section-head"><h2>Pending orders</h2><span class="pill">${state.orders.filter(o=>o.status==='pending').length} waiting</span></div>${state.orders.filter(o=>o.status==='pending').length?state.orders.filter(o=>o.status==='pending').map(o=>`<div class="held-line"><div><strong>${o.side==='buy'?'Buy':'Sell'} ${o.qty} ${o.ticker}</strong><small>${o.type==='limit'?'Limit '+money(o.limit):'Market order'} · placed Day ${o.day}, ${o.placedAt}${o.note?' · '+o.note:''}</small></div><button class="btn btn-ghost" data-action="cancelorder" data-order="${o.id}">Cancel</button></div>`).join(''):'<p class="hint">No pending orders. You can queue trades while the market is closed.</p>'}</div>
    <div class="grid two"><div class="panel panel-pad"><div class="section-head"><h2>Current holdings</h2><span class="pill">${holdings.length} companies</span></div>${holdings.length?`<table class="market-table"><thead><tr><th>Company</th><th>Shares</th><th>Market value</th><th>Gain / loss</th></tr></thead><tbody>${holdings.map(([t,h])=>{const c=company(t);return `<tr data-company="${t}"><td><strong>${t}</strong><span class="ticker">Avg. ${money(h.avg)}</span></td><td>${h.qty}</td><td>${money(h.qty*c.price)}</td><td>${signed((c.price-h.avg)/h.avg)}</td></tr>`}).join('')}</tbody></table>`:'<div class="empty">You have no shares yet. Browse companies, learn about their finances, and choose whether to invest.<br/><button class="btn btn-primary" style="margin-top:15px" data-nav="market">Browse companies</button></div>'}</div><div class="panel panel-pad"><div class="section-head"><h2>Trade history</h2><span class="pill blue">NO FEES · PROTOTYPE</span></div>${state.trades.length?`<div class="activity-list">${state.trades.slice(0,12).map(t=>`<div class="activity-row"><div><strong>${t.side==='buy'?'Bought':'Sold'} ${t.qty} ${t.ticker}</strong><small>Day ${t.day} · ${money(t.price)} per share</small></div><strong class="${t.side==='sell'?'pos':''}">${t.side==='buy'?'−':'+'}${money(t.value)}</strong></div>`).join('')}</div>`:'<div class="empty">Your buy and sell activity will appear here.</div>'}</div></div><div class="notice"><strong>How to read this:</strong> Unrealized gains and losses change with the market. Realized gains and losses come from selling shares. Your overall result is portfolio value minus your original $10,000; no borrowing, fees, taxes, or dividend payments are modeled yet.</div>`;
  }
  function academy(){
    const lessons=[['Ownership','A stock is a piece of ownership in a company. Owning shares does not automatically give you its profits as cash.'],['Earnings per share','EPS = annual earnings ÷ shares outstanding. We show fictional annual EPS in each company’s financial snapshot.'],['Price / earnings','P/E = stock price ÷ annual EPS. A higher ratio means investors pay more per dollar of current earnings, often because they expect future growth.'],['Price vs. business','A company can improve while its stock declines. Price reflects buyers’ and sellers’ expectations, not just today’s profits.'],['Risk & diversification','Owning companies across several industries can reduce company- or sector-specific risk, but broad market declines can hurt many stocks at once.'],['Social-media literacy','Ask: Who is posting? What evidence supports the claim? Is it a fact or a forecast? Could the poster benefit if others buy or sell?'],['Unrealized / realized','Gains and losses on shares you still own are unrealized. Selling realizes them. Unrealized losses still represent a real change in what your shares are currently worth.'],['How this prototype prices shares','Each simulated day, companies face business changes; earnings estimates, economic conditions, and investor sentiment affect how buyers value stocks. A little uncertainty is added. It is an educational simplified model, not a real matching engine.'],['Market and limit orders','Market orders attempt to buy or sell at the available simulated price. Limit orders set a maximum buying price or minimum selling price. Orders entered when the market is closed are queued until regular trading resumes.'],['Dividends — coming later','A dividend distributes cash to eligible shareholders. A dividend is not free money: the business parts with cash, and its price may adjust when shares go ex-dividend. Dividends are not paid in this prototype.']];
    return `${sectionIntro('LEARN BY INVESTIGATING','Field Guide','Quick explanations you can consult when a question arises during play. No quizzes required.')}
    <div class="promo-box"><strong>Prototype rule: explanations never force a decision.</strong><p>Use MarketPulse to assess claims, investigate company finances, and make your own calls. A profitable decision can be lucky, and a careful decision can still lose money.</p></div><div class="guide-grid">${lessons.map((l,i)=>`<div class="panel guide-card"><div class="guide-number">CONCEPT ${String(i+1).padStart(2,'0')}</div><h3>${l[0]}</h3><p>${l[1]}</p></div>`).join('')}</div>`;
  }
  function render(){
    $('viewHeading').textContent=ui.view==='detail'?'Company Research':navLabel[ui.view];$('dayLabel').textContent='DAY '+String(state.day).padStart(2,'0');$('cycleLabel').textContent=economy();
    $('pulseCount').textContent=Math.min(99,state.posts.length);document.querySelectorAll('[data-nav].nav-link').forEach(b=>b.classList.toggle('active',b.dataset.nav===(ui.view==='detail'?'market':ui.view)));
    let content;switch(ui.view){case'market':content=market();break;case'detail':content=companyDetail();break;case'pulse':content=pulse();break;case'portfolio':content=portfolio();break;case'academy':content=academy();break;default:content=dashboard();}
    const alert=ui.eventAlert?`<div class="event-alert" role="status"><div><strong>⏸ Breaking news — simulation paused</strong><p>${escapeHtml(ui.eventAlert.headline)}</p><small>${escapeHtml(ui.eventAlert.detail)}</small></div><button class="btn btn-ghost" data-action="dismissalert">Got it</button></div>`:'';
    $('main').innerHTML=alert+content;
    $('clockStatus').textContent=`${timeLabel()} · ${blockName()} · ${openNow()?'Market open':'Market closed'} · ${ui.autoTimer?'Running':'Paused'}`;
    $('timeText').textContent=`${timeLabel()} · ${blockName()}`;
    $('timeProgress').style.width=`${(state.minuteOfDay%360===0&&state.minuteOfDay>0?100:(state.minuteOfDay%360)/360*100)}%`;
    $('toggleAuto').textContent=ui.autoTimer?'❚❚ Pause':state.minuteOfDay%360===0&&state.minuteOfDay>0?'▶ Next block':'▶ Play block';
    $('toggleAuto').classList.toggle('btn-danger',Boolean(ui.autoTimer));$('toggleAuto').classList.toggle('btn-primary',!ui.autoTimer);
    $('marketState').textContent=openNow()?'● OPEN':'○ CLOSED';
  }
  function go(page){ui.view=page;render();$('main').scrollTop=0;}
  function toast(msg){let t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(ui.toastTimer);ui.toastTimer=setTimeout(()=>t.classList.remove('show'),2500)}
  function applyEvent(event) {
    const c=company(event.ticker);c.eps=Math.max(.10,c.eps*(1+event.impact));c.margin=Math.max(.8,Math.min(25,c.margin+event.impact*5));c.sentiment=Math.max(-1,Math.min(1,c.sentiment+event.mood));
    addNews(c.ticker,event.headline,event.detail);
    post(c.name,`@${c.ticker}_Official`,c.icon,c.ticker,event.official,'Company statement',`The statement is from the company’s verified fictional account. ${event.detail}`,event.question,100+Math.floor(random()*175),true);
    post('Ellis Ward, CFA','@EllisEvaluates','📊',c.ticker,`New ${c.ticker} update: it's worth checking how the earnings outlook changes, not just whether the headline sounds good.`,'Analyst interpretation',`This analyst flags a relevant question, but no single commentary establishes a fair price. ${event.detail}`,`Open ${c.ticker}'s financial snapshot. Compare its P/E ratio and possible risks.`,35+Math.floor(random()*150));
    return {c,event};
  }
  const RANDOM_EVENTS=[
    {type:'positive',summary:'reports stronger repeat-customer demand',impact:.045,shock:.02,detail:'Sales momentum may help earnings if costs stay controlled.'},
    {type:'negative',summary:'warns of supplier cost increases',impact:-.05,shock:-.023,detail:'Higher operating costs could reduce future earnings.'},
    {type:'mixed',summary:'announces a costly new expansion',impact:-.025,shock:.012,detail:'Expansion may improve future growth while reducing profit today.'},
    {type:'negative',summary:'faces a product or service disruption',impact:-.065,shock:-.031,detail:'Operations have become less predictable; investors reassess risk.'},
    {type:'positive',summary:'finds efficiencies in operations',impact:.055,shock:.025,detail:'Lower costs may improve profit even without higher revenue.'}
  ];
  function announceMajor(evt){
    const fired=applyEvent(evt);fired.c.eventImpulse+=evt.priceShock;fired.c.lastEventDay=state.day;
    fired.c.priceReason=evt.detail+' Investors are reassessing the news; other trading forces can also matter.';
    state.lastEvent={day:state.day,headline:evt.headline,detail:evt.detail,ticker:evt.ticker};
    ui.eventAlert=state.lastEvent;
    return fired;
  }
  const tradingTick = () => {
    const confidence=(state.macro.confidence-50)/1200;
    for(const c of state.companies){
      const fair=c.eps*c.pe*(1-(state.macro.rate-3.8)*.05+c.sentiment*.08);
      const valuation=Math.max(-.002,Math.min(.002,(fair-c.price)/Math.max(c.price,.5)*.004));
      const economyMove=(confidence*c.cyclical+Math.sin(state.day/18)*.0028)/26;
      const noise=(random()-.5)*.008*c.volatility;
      const surprise=c.eventImpulse/8;c.eventImpulse*=.875;if(Math.abs(c.eventImpulse)<.00001)c.eventImpulse=0;
      const move=Math.max(-.045,Math.min(.045,valuation+economyMove+noise+surprise));
      const beforePrice=c.price;
      c.price=round(Math.max(.5,c.price*(1+move)));c.change=liveMove(c);
      const heldShares=state.holdings[c.ticker]?.qty||0;
      if(heldShares)state.dailyStockPnl[c.ticker]=round((state.dailyStockPnl[c.ticker]||0)+heldShares*(c.price-beforePrice));
      if(c.lastEventDay===state.day){/* keep clear, grounded company news */}
      else if(Math.abs(move)>=.008)c.priceReason=`${move>=0?'Buyers pushed the price higher':'Sellers pushed the price lower'} amid ordinary trading. There was no confirmed company announcement causing this move.`;
      else c.priceReason='Routine trading, economic expectations, and uncertainty moved the price. No specific company news explains this change.';
    }
  };
  function newDay(){
    if(state.liveTrace&&state.liveTrace.length>1)state.previousTrace=state.liveTrace.slice();
    state.day++;state.minuteOfDay=0;
    state.dayOpeningEquity=getEquity();state.dayOpeningPrices={};state.dailyStockPnl={};
    for(const c of state.companies){c.prevClose=c.price;state.dayOpeningPrices[c.ticker]=c.price;c.change=0;c.lastEventDay=0;c.priceReason='The new day has not begun regular trading yet.';}
    state.liveTrace=[{day:state.day,minute:570,equity:state.dayOpeningEquity,prices:{...state.dayOpeningPrices}}];
    state.macro.confidence=Math.max(28,Math.min(77,state.macro.confidence+(random()-.49)*2.7));
    state.macro.inflation=Math.max(1,Math.min(6,state.macro.inflation+(random()-.51)*.035));
    state.macro.rate=Math.max(1,Math.min(7,state.macro.rate+(random()-.51)*.013));
    for(const c of state.companies){c.eps=Math.max(.1,c.eps*(1+c.growth/260+(state.macro.confidence-50)/14000*c.cyclical+(random()-.5)*.0012));c.sentiment*=.97;}
  }
  function executeOrder(o){
    const c=company(o.ticker);if(!c)return false;
    if(o.type==='limit'&&(o.side==='buy'?c.price>o.limit:c.price<o.limit))return false;
    const value=round(o.qty*c.price),h=state.holdings[o.ticker]||{qty:0,avg:0};
    if(o.side==='buy'&&value>state.cash+.00001){o.note='Not enough cash at execution price';return false;}
    if(o.side==='sell'&&o.qty>h.qty){o.note='Not enough shares at execution';return false;}
    if(o.side==='buy'){h.avg=(h.qty*h.avg+value)/(h.qty+o.qty);h.qty+=o.qty;state.holdings[o.ticker]=h;state.cash=round(state.cash-value);}
    else{state.realized=round(state.realized+o.qty*(c.price-h.avg));h.qty-=o.qty;state.cash=round(state.cash+value);if(h.qty===0)delete state.holdings[o.ticker];else state.holdings[o.ticker]=h;}
    state.trades.unshift({day:state.day,time:timeLabel(),side:o.side,ticker:o.ticker,qty:o.qty,price:c.price,value});state.trades=state.trades.slice(0,120);
    o.status='filled';o.filledAt=`Day ${state.day}, ${timeLabel()}`;return true;
  }
  function processOrders(){for(const o of state.orders){if(o.status==='pending'&&executeOrder(o))toast(`${o.side==='buy'?'Bought':'Sold'} ${o.qty} ${o.ticker} at ${money(company(o.ticker).price)}`);}}
  function timedNews(){
    if(state.minuteOfDay===630&&tradingDay()){
      let evt=PRESET_EVENTS[state.day]||({8:PRESET_EVENTS[7],22:PRESET_EVENTS[21],29:PRESET_EVENTS[28]})[state.day]||null;
      if(!evt&&state.day>15&&random()<.18){const c=state.companies[Math.floor(random()*state.companies.length)],e=RANDOM_EVENTS[Math.floor(random()*RANDOM_EVENTS.length)];evt={ticker:c.ticker,impact:e.impact,priceShock:e.shock,mood:e.impact>0?.1:-.1,headline:`${c.name} ${e.summary}`,detail:e.detail,official:`Company update: we ${e.summary}. More details will follow.`,question:'What might this mean for future profitability?'};}
      if(evt){announceMajor(evt);return true;}
      if(state.day===33){state.macro.confidence=39;ui.eventAlert={headline:'Consumer confidence drops across the economy',detail:'Households are cutting optional spending. Travel and technology companies may be particularly sensitive.'};addNews('ECON',ui.eventAlert.headline,ui.eventAlert.detail);return true;}
      if(state.day===57){state.macro.confidence=61;ui.eventAlert={headline:'Consumer confidence begins to recover',detail:'Recovery can help businesses before their profits fully rebound.'};addNews('ECON',ui.eventAlert.headline,ui.eventAlert.detail);return true;}
    }
    if(state.minuteOfDay===1140){const c=state.companies[Math.floor(random()*state.companies.length)];post('Market Observer','@TickerTalk','🔎',c.ticker,`After today's session, I'm watching ${c.ticker}. Curious whether tomorrow confirms this move or reverses it.`,'Opinion, not a fact','The writer is speculating about tomorrow. Nobody knows the outcome.','A single day of movement does not tell us where the next day will go.',42+Math.floor(random()*90));}
    return false;
  }
  function tick(){
    if(state.minuteOfDay===1440)newDay();
    const prior=state.minuteOfDay;
    state.minuteOfDay+=15;
    if(openNow()){
      // An opening gap reflects overnight reassessment before queued orders can fill.
      if(prior<570){for(const c of state.companies){const previousPrice=c.price;const gap=(state.macro.confidence-50)/4500*c.cyclical+(random()-.5)*.012*c.volatility;c.price=round(Math.max(.5,c.price*(1+gap)));c.change=liveMove(c);const heldShares=state.holdings[c.ticker]?.qty||0;if(heldShares)state.dailyStockPnl[c.ticker]=round((state.dailyStockPnl[c.ticker]||0)+heldShares*(c.price-previousPrice));c.priceReason='The opening price reflects overnight expectations and uncertainty; there is not necessarily fresh company news.';}processOrders();}
      tradingTick();processOrders();snapshotTrace();
    }
    const event=timedNews();
    if(state.minuteOfDay===960&&tradingDay()){snapshotTrace();for(const c of state.companies){c.history.push(c.price);if(c.history.length>65)c.history.shift();}}
    if(event)pauseAuto(false);
    if(state.minuteOfDay%360===0)pauseAuto(false);
    save();render();
  }
  function advanceDays(n){pauseAuto(false);for(let i=0;i<n*96;i++)tick();save();render();}
  function pauseAuto(redraw=true){if(ui.autoTimer!==null){clearInterval(ui.autoTimer);ui.autoTimer=null;if(redraw)render();}}
  function runAuto(){if(ui.autoTimer!==null){pauseAuto();return;}ui.eventAlert=null;const rate=ui.speed==='fast'?95:380;ui.autoTimer=setInterval(tick,rate);render();}
  function advanceBlock(){pauseAuto(false);ui.eventAlert=null;do{tick()}while(state.minuteOfDay%360!==0&&!ui.eventAlert);save();render();}

  function openTrade(t){pauseAuto();const c=company(t);if(!c)return;ui.tradeTicker=t;ui.tradeSide='buy';ui.orderType='market';ui.tradeQty=1;renderModal();}
  function renderModal(){const c=company(ui.tradeTicker);if(!c)return;const held=state.holdings[c.ticker]?.qty||0;
    $('overlay').classList.remove('hidden');$('overlay').setAttribute('aria-hidden','false');$('overlay').innerHTML=`<div class="trade-modal" role="dialog" aria-modal="true" aria-labelledby="tradeHeading"><header><div><h2 id="tradeHeading">Trade ${c.ticker}</h2><p>${escapeHtml(c.name)} · current ${money(c.price)} / share</p></div><button class="icon-button" data-action="closemodal" aria-label="Close trade dialog">×</button></header><div class="trade-switch"><button data-action="tradeside" data-side="buy" class="${ui.tradeSide==='buy'?'active':''}">Buy</button><button data-action="tradeside" data-side="sell" class="${ui.tradeSide==='sell'?'active':''}">Sell</button></div><label class="input-label" for="tradeQty">Number of whole shares</label><input id="tradeQty" class="trade-input" type="number" min="1" step="1" value="${ui.tradeQty}" inputmode="numeric"/><p class="hint" style="margin-top:8px">${ui.tradeSide==='buy'?`Available cash: ${money(state.cash)}`:`Shares owned: ${held}`}</p><label class="input-label" for="tradeType">How should we buy or sell?</label><select id="tradeType" class="trade-input simple-select"><option value="market" ${ui.orderType==='market'?'selected':''}>Market order — best available price</option><option value="limit" ${ui.orderType==='limit'?'selected':''}>Limit order — set a price</option></select>${ui.orderType==='limit'?`<label class="input-label" for="limitPrice" style="margin-top:12px">${ui.tradeSide==='buy'?'Maximum purchase price':'Minimum selling price'}</label><input id="limitPrice" class="trade-input" type="number" min="0.01" step="0.01" value="${c.price.toFixed(2)}"/>`:''}<div class="trade-summary"><div class="summary-line"><span>Current reference price</span><strong>${money(c.price)}</strong></div><div class="summary-line"><span>Estimated value at that price</span><strong id="tradeTotal">${money(c.price)}</strong></div><div class="summary-line"><span>When it happens</span><strong>${openNow()?'Now if price allows; otherwise queued':'Queued until regular trading opens'}</strong></div></div><div id="tradeError" class="error" aria-live="polite"></div><div class="modal-actions"><button class="btn btn-ghost" data-action="closemodal">Cancel</button><button class="btn btn-primary" data-action="confirmtrade">${openNow()?'Submit order':'Queue order'}</button></div><p class="hint" style="margin:13px 0 0">Queued market orders use the available execution price, which can be different from today's price. A limit order may never fill. All money is fictional.</p></div>`;$('tradeQty').focus();}
  function closeModal(){ui.tradeTicker=null;$('overlay').classList.add('hidden');$('overlay').setAttribute('aria-hidden','true');$('overlay').innerHTML='';}
  function confirmTrade(){const c=company(ui.tradeTicker),qty=Number($('tradeQty').value),error=$('tradeError');if(!Number.isSafeInteger(qty)||qty<=0){error.textContent='Enter a positive whole number of shares.';return;}
    const limit=ui.orderType==='limit'?Number($('limitPrice')?.value):null;if(ui.orderType==='limit'&&(!Number.isFinite(limit)||limit<=0)){error.textContent='Enter a valid limit price.';return;}
    const held=state.holdings[c.ticker]?.qty||0;const estimate=qty*(ui.orderType==='limit'&&ui.tradeSide==='buy'?limit:c.price);
    if(ui.tradeSide==='buy'&&estimate>state.cash+.0001){error.textContent='Not enough cash for this estimated order. Try fewer shares.';return;}
    if(ui.tradeSide==='sell'&&qty>held){error.textContent=`You own only ${held} shares.`;return;}
    const o={id:state.orderSeq++,day:state.day,placedAt:timeLabel(),ticker:c.ticker,qty,side:ui.tradeSide,type:ui.orderType,limit,status:'pending'};
    state.orders.unshift(o);if(openNow())executeOrder(o);
    const filled=o.status==='filled',word=filled?'Filled':'Queued';closeModal();save();render();toast(`${word}: ${o.side} ${qty} ${o.ticker}${o.type==='limit'?' (limit '+money(o.limit)+')':''}`);
  }

  function reset(){pauseAuto();if(!window.confirm('Reset Cedar Exchange? Your portfolio, trading history, and simulated market history will be erased.'))return;closeModal();state=startup();startupFeed();ui.view='dashboard';ui.postId=null;ui.postFilter='all';ui.marketFilter='all';save();render();toast('New simulation started.');}
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-action], [data-nav], [data-company], [data-post], [data-marketfilter], [data-postfilter]');if(!b)return;
    if(b.dataset.action){const a=b.dataset.action;switch(a){case'advance':advanceBlock();break;case'dismissalert':ui.eventAlert=null;render();break;case'cancelorder':{const o=state.orders.find(o=>o.id===Number(b.dataset.order));if(o&&o.status==='pending'){o.status='canceled';save();render();}break;}case'toggleauto':runAuto();break;case'reset':reset();break;case'trade':openTrade(b.dataset.ticker);break;case'closemodal':closeModal();break;case'tradeside':ui.tradeQty=Number($('tradeQty')?.value)||1;ui.tradeSide=b.dataset.side;renderModal();break;case'confirmtrade':confirmTrade();break;case'watch':{const t=b.dataset.ticker;state.watchlist=state.watchlist.includes(t)?state.watchlist.filter(x=>x!==t):[...state.watchlist,t];save();render();break;}case'viewcompany':ui.company=b.dataset.ticker;go('detail');break;}return;}
    if(b.dataset.post){ui.postId=Number(b.dataset.post);go('pulse');return;}
    if(b.dataset.marketfilter){ui.marketFilter=b.dataset.marketfilter;render();return;}
    if(b.dataset.postfilter){ui.postFilter=b.dataset.postfilter;ui.postId=null;render();return;}
    if(b.dataset.company){ui.company=b.dataset.company;go('detail');return;}
    if(b.dataset.nav){go(b.dataset.nav);return;}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.tradeTicker)closeModal();if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-post]')){e.preventDefault();ui.postId=Number(e.target.dataset.post);go('pulse');}});
  document.addEventListener('input',e=>{if(e.target.id==='tradeQty'&&ui.tradeTicker){const qty=Number(e.target.value)||0;ui.tradeQty=qty;$('tradeTotal').textContent=money(qty*company(ui.tradeTicker).price);$('tradeError').textContent='';}});
  document.addEventListener('change',e=>{if(e.target.id==='chartTicker'){ui.chartTicker=e.target.value;render();}if(e.target.id==='tradeType'&&ui.tradeTicker){ui.tradeQty=Number($('tradeQty')?.value)||1;ui.orderType=e.target.value;renderModal();}});
  $('speedSelect').addEventListener('change',e=>{let wasRunning=ui.autoTimer!==null;if(wasRunning)pauseAuto();ui.speed=e.target.value;if(wasRunning)runAuto();else render();});
  $('overlay').addEventListener('click',e=>{if(e.target.id==='overlay')closeModal();});
  // Public debug state for browser smoke-testing. No user data leaves the device.
  window.CedarExchange = Object.freeze({snapshot:()=>JSON.parse(JSON.stringify(state)),advance:advanceDays,tick,play:runAuto,pause:pauseAuto});
  save();render();
})();