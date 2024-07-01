const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

async function fetchCryptoData() {
    try {
        console.log('Fetching data...');
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data fetched:', data); // Log para verificar los datos obtenidos
        displayCryptoData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayCryptoData(data) {
    const container = document.getElementById('crypto-container');
    container.innerHTML = '';

    data.forEach(crypto => {
        const cryptoElement = document.createElement('div');
        cryptoElement.className = 'crypto';

        const priceChangeColor = crypto.price_change_percentage_24h > 0 ? 'green' : 'red';

        cryptoElement.innerHTML = `
            <h2>
                <img src="${crypto.image}" alt="${crypto.name} logo" />
                ${crypto.name} (${crypto.symbol.toUpperCase()})
            </h2>
            <p>Precio actual: $${crypto.current_price} USD</p>
            <p>Cambió en 24h: <span style="color: ${priceChangeColor};">${crypto.price_change_percentage_24h.toFixed(2)}%</span></p>
            ${crypto.market_cap_rank ? `<p>Ranking de capitalización de mercado: ${crypto.market_cap_rank}</p>` : ''}
            <div id="chart-${crypto.id}" class="chart-container"></div>
        `;

        container.appendChild(cryptoElement);

        if (crypto.sparkline_in_7d && crypto.sparkline_in_7d.price) {
            const chartId = `chart-${crypto.id}`;
            const chartData = crypto.sparkline_in_7d.price.map((price, index) => ({
                x: new Date(Date.now() - (10 - index) * 24 * 60 * 60 * 1000),
                y: price
            }));

            renderChart(chartId, chartData);
        }
    });
}

function renderChart(chartId, data) {
    const options = {
        series: [{
            data: data
        }],
        chart: {
            type: 'line',
            height: 150,
            toolbar: {
                show: false
            }
        },
        stroke: {
            curve: 'smooth'
        },
        markers: {
            size: 0
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return '$' + val.toFixed(2);
                }
            }
        }
    };

    const chart = new ApexCharts(document.getElementById(chartId), options);
    chart.render();
}

fetchCryptoData();
setInterval(fetchCryptoData, 60000); // Actualiza cada 60 segundos

document.getElementById('checkbox').addEventListener('change', (event) => {
    document.body.classList.toggle('light-theme', event.target.checked);
    document.body.classList.toggle('dark-theme', !event.target.checked);
    updateLogo();
});

const updateLogo = () => {
    const logo = document.getElementById('logo');
     // Hacer que la imagen se desvanezca
    setTimeout(() => {
        if (document.body.classList.contains('light-theme')) {
            logo.src = 'img/logo-withe.gif';
        } else {
            logo.src = 'img/LOGO.gif';
        }
        logo.style.opacity = 1; // Hacer que la imagen aparezca
    }, 0); // El tiempo debe coincidir con la duración de la transición
};

// Set the initial theme based on the user's preference or default to dark theme
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
const checkbox = document.getElementById('checkbox');

if (prefersDarkScheme) {
    document.body.classList.add('dark-theme');
    checkbox.checked = false;
} else {
    document.body.classList.add('light-theme');
    checkbox.checked = true;
}
updateLogo();

