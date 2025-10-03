🖼️ Mosaico Geográfico: Arte por Localização

Um PWA interativo que utiliza geolocalização para buscar e exibir obras do Rijksmuseum relacionadas à sua cidade atual.
O projeto combina HTML + TailwindCSS + JavaScript com integração de APIs públicas (Rijksmuseum e OpenStreetMap/Nominatim).

🚀 Funcionalidades

📍 Obtém a localização do usuário via Geolocation API.

🗺️ Converte latitude/longitude em nome de cidade usando Nominatim (OpenStreetMap).

🎨 Busca obras de arte relacionadas à cidade no Rijksmuseum API.

🖼️ Exibe os resultados em um layout responsivo, com cartões estilizados.

📲 Estrutura pensada para PWA (Progressive Web App) com suporte a Service Worker (em desenvolvimento).

🛠️ Tecnologias Utilizadas

Frontend:

HTML5 + TailwindCSS

CSS customizado (style.css)

JavaScript (script.js)

APIs:

Rijksmuseum API

Nominatim (OpenStreetMap)

Outros:

Geolocation API (navegador)

Estrutura PWA com manifest e service worker (mock incluído)

📂 Estrutura do Projeto
.
├── index.html      # Página principal
├── style.css       # Estilos customizados
├── script.js       # Lógica da aplicação (geolocalização + API)
└── manifest.json   # Manifest PWA (mockado no script)

▶️ Como Executar

Clone este repositório:

git clone https://github.com/seu-usuario/mosaico-geografico.git
cd mosaico-geografico


Abra o arquivo index.html no navegador.
(Para PWA completo, é recomendado rodar em servidor local, ex: live-server ou extensão VS Code).

📌 Melhorias Futuras

Implementar e registrar Service Worker para cache offline.

Adicionar opção de busca manual por cidades.

Melhorar UX para mensagens de erro.

Expandir integração com outros museus ou coleções de arte.

👨‍💻 Autor

Desenvolvido por Wslany como exercício de integração entre geolocalização, APIs e PWA.
