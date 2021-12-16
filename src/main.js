const base = {
    key: "API KEY HERE!!!!!!!!!",
    url: "https://financialmodelingprep.com/api/v3/"
}

let ticker_input = document.getElementById("input");
ticker_input.addEventListener("keypress", enter_press);

/**
 * Takes in array of prices (floats) from 30 days
 * ago until today. Then converts (day, price) to an
 * (x, y) coordinate on the canvas and draws a line from
 * the previous point to the current one creating
 * a price chart.
 * @param {float[]} prices 
 */
function create_graph(prices) {
    const day = [...Array(30).keys()];

    const graph = document.querySelector('#graph');
    const width = graph.width;
    const height = graph.height;
    
    let color = prices[0] < prices[prices.length -1] ? '#28C869' : '#EF4B56';
    let month_percent_change = document.getElementById("monthPercent");
    let dollars = (prices[prices.length -1] - prices[0]).toFixed(2)
    let prefix = dollars > 0 ? '+' : '-';
    dollars = Math.abs(dollars).toString();

    let percent = ((dollars / prices[prices.length -1]) * 100).toFixed(2);
    month_str = `${prefix}$${dollars} (${prefix}${percent}%)`
    month_percent_change.innerHTML = month_str
    month_percent_change.style.color = color; 

    const ctx = graph.getContext('2d');
    ctx.clearRect(0, 0, graph.width, graph.height);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    let top = Math.max.apply(null, prices);
    const bottom = Math.min.apply(null, prices);
    // Distance in $ between highest and lowest price 
    const dist = top - bottom;
    // Pixels Per $  in difference
    const ppd = height / dist;

    let prev_x = 0;
    let prev_y = 0;
    ctx.beginPath();
    for (let i = 0; i < 30; i++) {
        let price = prices[i];
        ctx.moveTo(prev_x, prev_y);

        let new_y = Math.abs(height - (dist - (top - price)) * ppd);
        let new_x = day[i] * (width / 30);

        prev_x = new_x;
        prev_y = new_y;
        if (i != 0) {
            ctx.lineTo(new_x, new_y);
            ctx.stroke();
        }   
    }  
}

function enter_press(event) {
    if (event.code === 'Enter') {
        let ticker = ticker_input.value.toUpperCase();
        if (is_valid_ticker(ticker)) {
            get_json_data(ticker)
        }  
    }
}

function is_valid_ticker(ticker) {
    if (ticker.length < 1 || ticker.length > 4) {
        ticker_input.style.border = "2px solid red";
        return false;
    }
    ticker_input.style.border = "None";
    return true;
}

function get_json_data(ticker) {
    let url = `${base.url}quote/${ticker}?apikey=${base.key}`;
    fetch(url)
        .then(response => response.text())
        .then(data => display_ticker_data(JSON.parse(data)[0]));
}

function display_ticker_data(data) {
    const up = '↑';
    const down = '↓';

    const stock = document.getElementById("stock");
    const arrow = document.getElementById("arrow");
    const percent = document.getElementById("percent");
    
    let green = data.changesPercentage > 0 ? true : false;

    let stockStr = `${data.symbol}: $${data.price}`;
    stock.innerHTML = stockStr;

    let arrowStr = green ? up : down;
    arrow.innerHTML = arrowStr;

    let color = green ? "#28C869" : "#EF4B56";
    arrow.style.color = color;
    
    document.getElementById("pastMonth").innerHTML = "Past 30 days:";

    let change = Math.abs(data.previousClose - data.price).toFixed(2);
    let changeSymbol = green ? '+': '-';
    let percentStr = `${changeSymbol}$${change} (${changeSymbol}${Math.abs(data.changesPercentage.toFixed(2))}%)`;
    percent.innerHTML = percentStr;
                            
    percent.style.color = color;

    get_price_data(data.symbol);
}


function get_price_data(ticker) {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    let end = `${yyyy}-${mm}-${dd}`;
    
    today.setDate(today.getDate() - 50);
    dd = String(today.getDate()).padStart(2, '0');
    mm = String(today.getMonth() + 1).padStart(2, '0');
    yyyy = today.getFullYear();

    let start = `${yyyy}-${mm}-${dd}`;

    let url = `${base.url}historical-price-full/${ticker}?from=${start}&to=${end}&apikey=${base.key}`;
    fetch(url)
        .then(response => response.text())
        .then(data => parse_price_data(JSON.parse(data)));
}

function parse_price_data(data) {
    const days = data.historical

    let prices = []
    for (let i = 0; i < 30; i++) {
        prices.push(days[i].close);
    }
    prices.reverse();
    create_graph(prices);
}

