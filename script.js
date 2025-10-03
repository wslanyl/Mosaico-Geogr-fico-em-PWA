// =================================================================
// 1. CONFIGURAÇÕES E CONSTANTES
// =================================================================

const API_KEY = "xLHxMAkv";
const RIJKSMUSEUM_URL = (query) => `https://www.rijksmuseum.nl/api/en/collection?key=${API_KEY}&q=${query}&imgonly=true&ps=6&format=json`;
const MAX_RETRIES = 3;
const NOMINATIM_URL = (lat, lon) => `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;


// =================================================================
// 2. ACESSO AOS ELEMENTOS DO DOM
// =================================================================

let loadingIndicator, locationStatus, locationDisplay, artResults, initialMessage, errorMessage;

document.addEventListener('DOMContentLoaded', () => {
    loadingIndicator = document.getElementById('loadingIndicator');
    locationStatus = document.getElementById('locationStatus');
    locationDisplay = document.getElementById('locationDisplay');
    artResults = document.getElementById('artResults');
    initialMessage = document.getElementById('initialMessage');
    errorMessage = document.getElementById('errorMessage');

    initializePWA();
});


// =================================================================
// 3. FUNÇÕES UTILITÁRIAS
// =================================================================

function toggleLoading(show) {
    if (loadingIndicator) {
        loadingIndicator.classList.toggle('hidden', !show);
    }
}

function displayResults(objects) {
    if (!artResults) return;

    artResults.innerHTML = objects.map(art => {
        const imageUrl = art.webImage ? art.webImage.url : 'https://placehold.co/300x400/cccccc/333333?text=Sem+Imagem';
        return `
            <div class="bg-white rounded-xl overflow-hidden card-shadow hover:shadow-xl transition duration-300">
                <img src="${imageUrl}" 
                     onerror="this.onerror=null;this.src='https://placehold.co/300x400/cccccc/333333?text=Imagem+Indisponível';" 
                     alt="${art.title || 'Obra de Arte'}" 
                     class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="font-bold text-lg text-gray-900 line-clamp-2">${art.title || 'Título Desconhecido'}</h3>
                    <p class="text-sm text-indigo-600 font-medium mt-1">${art.principalOrFirstMaker || 'Artista Desconhecido'}</p>
                    <p class="text-xs text-gray-500 mt-2">${art.objectNumber || 'ID: N/A'}</p>
                </div>
            </div>
        `;
    }).join('');
}


// =================================================================
// 4. FUNÇÕES PRINCIPAIS (GEOLOCALIZAÇÃO E API)
// =================================================================

async function fetchCityName(lat, lon) {
    const url = NOMINATIM_URL(lat, lon);
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na Geocodificação Reversa');
        const data = await response.json();
        
        const address = data.address;
        if (address) {
            return address.city || address.state_district || address.country || 'world';
        }
        return 'world';
    } catch (error) {
        console.error("Erro na Geocodificação Reversa:", error);
        return 'painting'; 
    }
}

async function fetchArtByLocation(query) {
    const url = RIJKSMUSEUM_URL(query); 

    errorMessage.classList.add('hidden');
    artResults.innerHTML = '';
    toggleLoading(true);

    try {
        let response = null;
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                response = await fetch(url);
                if (response.ok) break; 
                
                if (i < MAX_RETRIES - 1) {
                    const delay = Math.pow(2, i) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch (fetchError) {
                if (i === MAX_RETRIES - 1) throw fetchError;
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        if (!response || !response.ok) {
            throw new Error(`Erro de rede ou API: ${response ? response.statusText : 'Falha na conexão'}`);
        }

        const data = await response.json();
        toggleLoading(false);

        if (data.artObjects && data.artObjects.length > 0) {
            displayResults(data.artObjects);
        } else {
            artResults.innerHTML = `<p class="text-gray-500 col-span-full text-center py-6">Nenhuma obra de arte encontrada para o local de busca: "${query}".</p>`;
        }

    } catch (error) {
        toggleLoading(false);
        errorMessage.textContent = `Falha ao carregar arte. Verifique a conexão. (${error.message})`;
        errorMessage.classList.remove('hidden');
        console.error("Erro no Fetch da API:", error);
    }
}

window.getGeolocationAndArt = function() {
    if (!navigator.geolocation) {
        locationStatus.textContent = '❌ Erro: Geolocalização não é suportada por este navegador.';
        return;
    }

    initialMessage.classList.add('hidden');
    locationStatus.textContent = '⏳ Buscando sua localização...';
    toggleLoading(true);

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            locationStatus.textContent = '⏳ Localização obtida. Buscando nome da cidade...';

            const cityQuery = await fetchCityName(lat, lon);

            locationStatus.textContent = `✅ Localização e Cidade Obtidas. Buscando arte relacionada a "${cityQuery}"...`;
            locationDisplay.classList.remove('hidden');
            locationDisplay.innerHTML = `
                <span class="font-semibold text-indigo-600">Busca por:</span> ${cityQuery}<br>
                <span class="text-xs text-gray-500">Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}</span>
            `;

            await fetchArtByLocation(cityQuery);
            toggleLoading(false);
            
            locationStatus.textContent = `✨ Resultados para "${cityQuery}" carregados!`;

        },
        (error) => {
            toggleLoading(false);
            let message = '❌ Erro ao obter localização: ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message += "Acesso negado pelo usuário.";
                    break;
                case error.TIMEOUT:
                    message += "Tempo limite excedido.";
                    break;
                default:
                    message += "Erro desconhecido.";
                    break;
            }
            locationStatus.textContent = message;
            locationDisplay.classList.add('hidden');
            console.error("Erro de Geolocalização:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}


// =================================================================
// 5. INICIALIZAÇÃO PWA (Service Worker)
// =================================================================

function initializePWA() {
    if ('serviceWorker' in navigator) {
        const mockManifest = {
            name: "Mosaico Brasileiro",
            short_name: "Mosaico BR",
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#4F46E5",
            icons: [
                { src: "https://placehold.co/192x192/4F46E5/ffffff?text=Arte", sizes: "192x192", type: "image/png" },
                { src: "https://placehold.co/512x512/4F46E5/ffffff?text=Arte", sizes: "512x512", type: "image/png" }
            ]
        };
        
        console.log('PWA: Service Worker (sw.js) precisa ser registrado aqui para cache e offline.');
    }
}
