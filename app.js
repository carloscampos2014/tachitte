import { menuData, settings } from './data.js';

// --- Funções para Geração do PIX Payload sem biblioteca ---
// Calcula o CRC16 para o payload do Pix
function CRC16_CCITT_calc(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= (str.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : (crc << 1);
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// Formata o ID do campo e o valor para o padrão EMV
function formatEMV(id, value) {
    const len = String(value.length).padStart(2, '0');
    return `${id}${len}${value}`;
}

// Constrói o payload completo do Pix
function getPixPayload(amount) {
    const txid = `TXID${Date.now()}`; // Gerando um identificador de transação único

    const payload = [
        formatEMV('00', '01'), // Payload Format Indicator
        formatEMV('26', [
            formatEMV('00', 'br.gov.bcb.pix'), // Merchant Account Information
            formatEMV('01', settings.pixKey) // Pix Key
        ].join('')),
        formatEMV('52', '0000'), // Merchant Category Code (MCC)
        formatEMV('53', '986'),  // Transaction Currency (BRL)
        formatEMV('54', amount.toFixed(2)), // Transaction Amount
        formatEMV('58', 'BR'), // Country Code
        formatEMV('59', settings.pixName), // Merchant Name
        formatEMV('60', settings.pixCity), // Merchant City
        formatEMV('62', formatEMV('05', txid)), // Transaction ID agora é dinâmico
    ].join('');

    const crc16 = CRC16_CCITT_calc(payload + '6304');
    return payload + '6304' + crc16;
}
// --- Fim das funções para Geração do PIX Payload sem biblioteca ---


// Estado global do app
const state = {
    cart: [],
    isDelivery: false,
    deliveryFee: settings.deliveryFee,
    selectedItem: null,
    selectedSize: null,
    selectedProtein: null,
    selectedToppings: [],
    selectedSweetToppings: [],
    selectedSodaFlavor: null
};

// Seletores do DOM
const tachittesList = document.getElementById('salgados-list');
const docesList = document.getElementById('doces-list');
const bebidasList = document.getElementById('bebidas-list');
const combosList = document.getElementById('combos-list');
const cartButton = document.getElementById('cart-button');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const customizeModal = document.getElementById('customize-modal');
const closeCartModal = document.getElementById('close-cart-modal');
const closeCustomizeModal = document.getElementById('close-customize-modal');
const ingredientsList = document.getElementById('ingredients-list');
const addCustomTachitteButton = document.getElementById('add-custom-tachitte-button');
const checkoutButton = document.getElementById('checkout-button');
const deliveryOptionBtn = document.getElementById('delivery-option');
const pickupOptionBtn = document.getElementById('pickup-option');
const statusMessage = document.getElementById('status-message');
const tabButtons = document.querySelectorAll('.tab-button');
const menuSections = document.querySelectorAll('.menu-tab');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutModal = document.getElementById('close-checkout-modal');
const deliveryInfoDiv = document.getElementById('delivery-info');
const sendWhatsappButton = document.getElementById('send-whatsapp-button');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');
const cardSubOptionsDiv = document.getElementById('card-sub-options');
const moneyChangeOptionsDiv = document.getElementById('money-change-options');
const moneyValueInput = document.getElementById('money-value');
const changeValueP = document.getElementById('change-value');
const pixInfoContainer = document.getElementById('pix-info-container');
const qrcodePixDiv = document.getElementById('qrcode-pix');
const copyPixKeyButton = document.getElementById('copy-pix-key');

// Novos seletores para os novos modais
const sizeChoiceModal = document.getElementById('size-choice-modal');
const sizeOptionsDiv = document.getElementById('size-options');
const closeSizeChoiceModal = document.getElementById('close-size-choice-modal');
const nextSizeButton = document.getElementById('next-size-button');
const proteinChoiceModal = document.getElementById('protein-choice-modal');
const closeProteinChoiceModal = document.getElementById('close-protein-choice-modal');
const nextProteinButton = document.getElementById('next-protein-button');
const toppingsChoiceModal = document.getElementById('toppings-choice-modal');
const toppingsListDiv = document.getElementById('toppings-list');
const closeToppingsChoiceModal = document.getElementById('close-toppings-choice-modal');
const addToppingsButton = document.getElementById('add-toppings-button');
const sweetToppingsChoiceModal = document.getElementById('sweet-toppings-choice-modal');
const sweetToppingsListDiv = document.getElementById('sweet-toppings-list');
const closeSweetToppingsChoiceModal = document.getElementById('close-sweet-toppings-choice-modal');
const addSweetToppingsButton = document.getElementById('add-sweet-toppings-button');
const sodaChoiceModal = document.getElementById('soda-choice-modal');
const sodaFlavorsListDiv = document.getElementById('soda-flavors-list');
const closeSodaChoiceModal = document.getElementById('close-soda-choice-modal');
const addSodaFlavorButton = document.getElementById('add-soda-flavor-button');
const customToppingsModal = document.getElementById('custom-toppings-modal');
const customToppingsList = document.getElementById('custom-toppings-list');
const closeCustomToppingsModal = document.getElementById('close-custom-toppings-modal');
const addCustomFinalButton = document.getElementById('add-custom-final-button');

// Elementos de rádio
const paymentMethodRadios = document.querySelectorAll('.payment-method-radio');


// Função para mostrar mensagem de feedback
function showStatusMessage(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.classList.remove('hidden', 'bg-red-500', 'bg-green-500');
    statusMessage.classList.add(type === 'success' ? 'bg-red-500' : 'bg-red-500');
    statusMessage.classList.add('animate-slide-in');
    setTimeout(() => {
        statusMessage.classList.remove('animate-slide-in');
        statusMessage.classList.add('animate-slide-out');
        setTimeout(() => {
            statusMessage.classList.add('hidden');
            statusMessage.classList.remove('animate-slide-out');
        }, 500);
    }, 3000);
}

// Função para renderizar um único item do menu
function renderMenuItem(item, listElement) {
    const itemHtml = `
                <div class="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
                    <div class="flex-shrink-0 mb-4">
                        <img src="${item.img}" alt="${item.name}" class="w-full h-52 object-cover rounded-md mb-4 menu-item-image">
                        <h3 class="text-lg font-bold text-red-900">${item.name}</h3>
                        <p class="text-sm text-red-400 min-h-[40px]">${item.description}</p>
                    </div>
                    <div class="flex items-center justify-between mt-auto">
                        <span class="text-xl font-bold text-red-600">R$ ${item.price.toFixed(2)}</span>
                        <button class="add-to-cart-btn bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors" data-id="${item.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </button>
                    </div>
                </div>
            `;
    listElement.innerHTML += itemHtml;
}

// Função para renderizar o menu completo
function renderMenu() {
    tachittesList.innerHTML = '';
    docesList.innerHTML = '';
    bebidasList.innerHTML = '';
    combosList.innerHTML = '';

    menuData.tachittes.filter(item => item.type === 'salty').forEach(item => renderMenuItem(item, tachittesList));
    menuData.tachittes.filter(item => item.type === 'sweet').forEach(item => renderMenuItem(item, docesList));
    menuData.bebidas.forEach(item => renderMenuItem(item, bebidasList));
    menuData.combos.forEach(item => renderMenuItem(item, combosList));
}

// Função para renderizar os ingredientes no modal de customização (para o tachitte customizado)
function renderIngredients() {
    const customizableIngredients = menuData.ingredientes.filter(ing =>
        !['Peixe', 'Carne', 'Tofu', 'Frango'].includes(ing.name)
    );

    ingredientsList.innerHTML = customizableIngredients.map(ing => `
                <label class="flex items-center space-x-2 p-2 border border-red-300 rounded-md cursor-pointer hover:bg-red-50 transition-colors">
                    <input type="checkbox" data-id="${ing.id}" data-name="${ing.name}" class="ing-checkbox rounded text-red-500 focus:ring-red-500">
                    <span class="text-sm">${ing.name}</span>
                </label>
            `).join('');
}

// Função para renderizar as opções de tamanho
function renderSizes() {
    sizeOptionsDiv.innerHTML = menuData.sizes.map(size => `
                <label class="flex items-center space-x-2 p-2 border border-red-300 rounded-md cursor-pointer hover:bg-red-50 transition-colors">
                    <input type="radio" name="size" data-id="${size.id}" data-name="${size.name}" data-price="${size.price}" class="size-radio rounded text-red-500 focus:ring-red-500">
                    <span class="text-sm">${size.name} ${size.description}</span>
                    <span class="text-sm text-red-600 ml-auto">${size.price > 0 ? `+R$ ${size.price.toFixed(2)}` : 'Grátis'}</span>
                </label>
            `).join('');
}

// Função para renderizar as opções de toppings salgados
function renderToppings() {
    toppingsListDiv.innerHTML = menuData.toppings.map(topping => `
                <label class="flex items-center space-x-2 p-2 border border-red-300 rounded-md cursor-pointer hover:bg-red-50 transition-colors">
                    <input type="checkbox" data-id="${topping.id}" data-name="${topping.name}" data-price="${topping.price}" class="topping-checkbox rounded text-red-500 focus:ring-red-500">
                    <span class="text-sm">${topping.name}</span>
                    <span class="text-sm text-red-600 ml-auto">+R$ ${topping.price.toFixed(2)}</span>
                </label>
            `).join('');
}

// Função para renderizar as opções de toppings doces
function renderSweetToppings() {
    sweetToppingsListDiv.innerHTML = menuData.sweetToppings.map(topping => `
                <label class="flex items-center space-x-2 p-2 border border-red-300 rounded-md cursor-pointer hover:bg-red-50 transition-colors">
                    <input type="checkbox" data-id="${topping.id}" data-name="${topping.name}" data-price="${topping.price}" class="sweet-topping-checkbox rounded text-red-500 focus:ring-red-500">
                    <span class="text-sm">${topping.name}</span>
                    <span class="text-sm text-red-600 ml-auto">+R$ ${topping.price.toFixed(2)}</span>
                </label>
            `).join('');
}

// Função para renderizar as opções de toppings para o customizado
function renderCustomToppings() {
    customToppingsList.innerHTML = menuData.toppings.map(topping => `
                <label class="flex items-center space-x-2 p-2 border border-red-300 rounded-md cursor-pointer hover:bg-red-50 transition-colors">
                    <input type="checkbox" data-id="${topping.id}" data-name="${topping.name}" data-price="${topping.price}" class="custom-topping-checkbox rounded text-red-500 focus:ring-red-500">
                    <span class="text-sm">${topping.name}</span>
                    <span class="text-sm text-red-600 ml-auto">+R$ ${topping.price.toFixed(2)}</span>
                </label>
            `).join('');
}

// Função para renderizar as opções de sabor de refrigerante
function renderSodaFlavors() {
    sodaFlavorsListDiv.innerHTML = menuData.sodaFlavors.map(flavor => `
                <label class="flex items-center space-x-2 p-2 border border-red-300 rounded-md cursor-pointer hover:bg-red-50 transition-colors">
                    <input type="radio" name="soda-flavor" data-id="${flavor.id}" data-name="${flavor.name}" data-price="${flavor.price}" class="soda-flavor-radio rounded text-red-500 focus:ring-red-500">
                    <span class="text-sm">${flavor.name}</span>
                </label>
            `).join('');
}

// Atualiza a visualização do carrinho (itens e total)
function updateCartView() {
    const cartItemsList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartItemsList.innerHTML = '';
    let total = 0;

    if (state.cart.length === 0) {
        cartItemsList.innerHTML = '<p class="text-red-400 text-center">Seu carrinho está vazio.</p>';
        checkoutButton.disabled = true;
        checkoutButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        checkoutButton.disabled = false;
        checkoutButton.classList.remove('opacity-50', 'cursor-not-allowed');

        state.cart.forEach((item, index) => {
            const price = item.price * item.quantity;
            total += price;

            let details = '';
            if (item.selectedSize) {
                details += `Tamanho: ${item.selectedSize.name}<br>`;
            }
            if (item.selectedProtein) {
                details += `Proteína: ${item.selectedProtein}<br>`;
            }
            if (item.selectedToppings && item.selectedToppings.length > 0) {
                details += `Toppings Salgados: ${item.selectedToppings.map(t => t.name).join(', ')}<br>`;
            }
            if (item.selectedSweetToppings && item.selectedSweetToppings.length > 0) {
                details += `Coberturas Doces: ${item.selectedSweetToppings.map(t => t.name).join(', ')}<br>`;
            }
            if (item.selectedSodaFlavor) {
                details += `Sabor: ${item.selectedSodaFlavor.name}<br>`;
            }
            if (item.ingredients) {
                details += `Ingredientes: ${item.ingredients.join(', ')}<br>`;
            }

            const itemHtml = `
                        <div class="flex items-center justify-between border-b pb-4">
                            <div class="flex items-center space-x-4">
                                <img src="${item.img}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md">
                                <div>
                                    <h4 class="font-bold text-red-900">${item.name}</h4>
                                    <p class="text-sm text-red-400">${details}</p>
                                    <span class="text-red-600">R$ ${item.price.toFixed(2)}</span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button class="update-quantity-btn w-6 h-6 rounded-full bg-red-200 text-red-600 flex items-center justify-center" data-index="${index}" data-action="decrease">-</button>
                                <span class="font-bold">${item.quantity}</span>
                                <button class="update-quantity-btn w-6 h-6 rounded-full bg-red-200 text-red-600 flex items-center justify-center" data-index="${index}" data-action="increase">+</button>
                                <button class="remove-from-cart-btn text-red-500 hover:text-red-700 transition-colors" data-index="${index}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                </button>
                            </div>
                        </div>
                    `;
            cartItemsList.innerHTML += itemHtml;
        });
    }

    // Adiciona a taxa de entrega se a opção estiver selecionada
    let finalTotal = total;
    const deliveryFeeElement = document.getElementById('delivery-fee-row');
    if (state.isDelivery) {
        finalTotal += state.deliveryFee;
        if (!deliveryFeeElement) {
            const deliveryFeeHtml = `
                        <div id="delivery-fee-row" class="flex justify-between text-sm text-red-400 mt-2">
                            <span>Taxa de Entrega:</span>
                            <span>R$ ${state.deliveryFee.toFixed(2)}</span>
                        </div>
                    `;
            cartItemsList.innerHTML += deliveryFeeHtml;
        }
    } else {
        if (deliveryFeeElement) {
            deliveryFeeElement.remove();
        }
    }

    cartTotal.textContent = `R$ ${finalTotal.toFixed(2)}`;
    cartCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Adiciona um item ao carrinho
function addItemToCart(item) {
    const newItem = { ...item, quantity: 1 };
    state.cart.push(newItem);
    updateCartView();
    showStatusMessage(`${item.name} adicionado ao carrinho!`);
}

// Função para alternar entre as abas
function showTab(tabId) {
    menuSections.forEach(section => {
        section.classList.add('hidden');
    });
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabId).classList.remove('hidden');
    document.querySelector(`#${tabId.replace('-menu', '-tab')}`).classList.add('active');
}

// Função para resetar os campos do formulário
function resetCheckoutForm() {
    addressInput.value = '';
    phoneInput.value = '';
    moneyValueInput.value = '';
    changeValueP.textContent = '';
    document.querySelector('input[name="payment-method"][value="PIX"]').checked = true;

    // Redefine a opção de pedido para Retirar
    state.isDelivery = false;
    pickupOptionBtn.classList.add('bg-red-500', 'text-white', 'hover:bg-red-600', 'rounded-lg');
    pickupOptionBtn.classList.remove('bg-red-400', 'hover:bg-red-500');
    deliveryOptionBtn.classList.add('bg-red-400', 'hover:bg-red-500', 'rounded-lg');
    deliveryOptionBtn.classList.remove('bg-red-500', 'text-white', 'hover:bg-red-600');

    // Remove a classe 'active' de todos os contêineres de pagamento e adiciona ao PIX
    document.querySelectorAll('.payment-options-container > div').forEach(div => div.classList.remove('active'));
    document.getElementById('pix-payment-option').classList.add('active');

    // Esconde todas as sub-opções
    pixInfoContainer.classList.add('hidden');
    cardSubOptionsDiv.classList.add('hidden');
    moneyChangeOptionsDiv.classList.add('hidden');
}

// Gera o QR Code do Pix
function generatePixQRCode(amount) {
    const payload = getPixPayload(amount);

    // Limpa o container e gera o novo QR Code
    qrcodePixDiv.innerHTML = '';
    new QRCode(qrcodePixDiv, payload);
}

// Manipuladores de eventos
document.addEventListener('click', (e) => {
    // Adicionar ao carrinho
    if (e.target.closest('.add-to-cart-btn')) {
        const button = e.target.closest('.add-to-cart-btn');
        const itemId = button.dataset.id;
        const item = menuData.tachittes.find(i => i.id === itemId) || menuData.bebidas.find(i => i.id === itemId) || menuData.combos.find(i => i.id === itemId);

        state.selectedItem = item;

        // Fluxo de personalização
        if (item.canCustomize) {
            renderSizes();
            sizeChoiceModal.classList.remove('hidden');
        } else if (item.isCustom) {
            // O item customizado também começa com a escolha de tamanho
            renderSizes();
            sizeChoiceModal.classList.remove('hidden');
        } else if (item.type === 'refri' && item.canChooseFlavor) {
            renderSodaFlavors();
            sodaChoiceModal.classList.remove('hidden');
        } else {
            if (item) {
                addItemToCart(item);
            }
        }
    }

    // Próximo passo (salgados e doces): Escolher tamanho -> Próximo modal
    if (e.target.closest('#next-size-button')) {
        const selectedSize = document.querySelector('input[name="size"]:checked');
        if (!selectedSize) {
            showStatusMessage('Por favor, selecione um tamanho.', 'error');
            return;
        }
        state.selectedSize = {
            name: selectedSize.dataset.name,
            price: parseFloat(selectedSize.dataset.price)
        };
        sizeChoiceModal.classList.add('hidden');

        if (state.selectedItem.type === 'salty') {
            proteinChoiceModal.classList.remove('hidden');
        } else if (state.selectedItem.type === 'sweet') {
            renderSweetToppings();
            sweetToppingsChoiceModal.classList.remove('hidden');
        } else if (state.selectedItem.isCustom) {
            renderIngredients();
            customizeModal.classList.remove('hidden');
        }
    }

    // Próximo passo: Escolher proteína -> Abrir modal de toppings salgados
    if (e.target.closest('#next-protein-button')) {
        const selectedProtein = document.querySelector('input[name="protein"]:checked');
        if (!selectedProtein) {
            showStatusMessage('Por favor, selecione uma proteína.', 'error');
            return;
        }
        state.selectedProtein = selectedProtein.value;
        proteinChoiceModal.classList.add('hidden');
        renderToppings();
        toppingsChoiceModal.classList.remove('hidden');
    }

    // Próximo passo (customizado): Escolher ingredientes -> Abrir modal de molhos
    if (e.target.closest('#next-custom-toppings-button')) {
        const selectedIngredients = Array.from(document.querySelectorAll('.ing-checkbox:checked')).map(cb => cb.dataset.name);
        if (selectedIngredients.length > 5) {
            showStatusMessage('Você pode selecionar no máximo 5 ingredientes.', 'error');
            return;
        }
        if (selectedIngredients.length === 0) {
            showStatusMessage('Selecione pelo menos um ingrediente.', 'error');
            return;
        }

        state.selectedCustomIngredients = selectedIngredients;
        customizeModal.classList.add('hidden');

        // Abre o modal para escolher molhos
        renderCustomToppings();
        customToppingsModal.classList.remove('hidden');
    }


    // Finalizar personalização e adicionar ao carrinho (Tachitte Salgado)
    if (e.target.closest('#add-toppings-button')) {
        state.selectedToppings = Array.from(document.querySelectorAll('.topping-checkbox:checked')).map(cb => ({
            name: cb.dataset.name,
            price: parseFloat(cb.dataset.price)
        }));

        const finalItem = { ...state.selectedItem };

        // Ajustar nome, descrição e preço com base nas escolhas
        finalItem.name = `${finalItem.name} (${state.selectedSize.name})`;
        finalItem.price += state.selectedSize.price;
        finalItem.name += ` (com ${state.selectedProtein})`;

        if (state.selectedToppings.length > 0) {
            finalItem.name += ` + Toppings`;
            state.selectedToppings.forEach(topping => {
                finalItem.price += topping.price;
            });
        }

        finalItem.selectedSize = state.selectedSize;
        finalItem.selectedProtein = state.selectedProtein;
        finalItem.selectedToppings = state.selectedToppings;

        addItemToCart(finalItem);

        // Limpar o estado de personalização
        state.selectedItem = null;
        state.selectedSize = null;
        state.selectedProtein = null;
        state.selectedToppings = [];

        toppingsChoiceModal.classList.add('hidden');
    }

    // Finalizar personalização e adicionar ao carrinho (Tachitte Doce)
    if (e.target.closest('#add-sweet-toppings-button')) {
        state.selectedSweetToppings = Array.from(document.querySelectorAll('.sweet-topping-checkbox:checked')).map(cb => ({
            name: cb.dataset.name,
            price: parseFloat(cb.dataset.price)
        }));

        const finalItem = { ...state.selectedItem };

        // Ajustar nome, descrição e preço com base nas escolhas
        finalItem.name = `${finalItem.name} (${state.selectedSize.name})`;
        finalItem.price += state.selectedSize.price;

        if (state.selectedSweetToppings.length > 0) {
            finalItem.name += ` + Coberturas`;
            state.selectedSweetToppings.forEach(topping => {
                finalItem.price += topping.price;
            });
        }

        finalItem.selectedSize = state.selectedSize;
        finalItem.selectedSweetToppings = state.selectedSweetToppings;

        addItemToCart(finalItem);

        // Limpar o estado de personalização
        state.selectedItem = null;
        state.selectedSize = null;
        state.selectedSweetToppings = [];

        sweetToppingsChoiceModal.classList.add('hidden');
    }

    // Finalizar personalização e adicionar ao carrinho (Tachitte customizado)
    if (e.target.closest('#add-custom-final-button')) {
        const selectedToppings = Array.from(document.querySelectorAll('.custom-topping-checkbox:checked'));
        if (selectedToppings.length > 2) {
            showStatusMessage('Você pode selecionar no máximo 2 molhos.', 'error');
            return;
        }

        state.selectedToppings = selectedToppings.map(cb => ({
            name: cb.dataset.name,
            price: parseFloat(cb.dataset.price)
        }));

        const customTachitte = {
            id: `custom-${Date.now()}`,
            name: `Tachitte Customizado`,
            description: `Com ${state.selectedCustomIngredients.join(', ')}.`,
            ingredients: state.selectedCustomIngredients,
            price: menuData.tachittes.find(t => t.isCustom).price + state.selectedSize.price,
            img: 'images/customizado.png',
            selectedSize: state.selectedSize
        };

        if (state.selectedToppings.length > 0) {
            customTachitte.selectedToppings = state.selectedToppings;
            customTachitte.name += ` + Molhos`;
            state.selectedToppings.forEach(topping => {
                customTachitte.price += topping.price;
            });
        }

        state.cart.push({ ...customTachitte, quantity: 1, selectedSize: state.selectedSize });
        customToppingsModal.classList.add('hidden');
        updateCartView();
        showStatusMessage('Tachitte customizado adicionado ao carrinho!');

        // Limpa o estado de personalização
        state.selectedItem = null;
        state.selectedSize = null;
        state.selectedCustomIngredients = [];
        state.selectedToppings = [];
    }

    // Adicionar refrigerante com sabor ao carrinho
    if (e.target.closest('#add-soda-flavor-button')) {
        const selectedFlavor = document.querySelector('input[name="soda-flavor"]:checked');
        if (!selectedFlavor) {
            showStatusMessage('Por favor, selecione um sabor.', 'error');
            return;
        }
        const flavorName = selectedFlavor.dataset.name;
        const item = state.selectedItem;

        const newItem = {
            ...item,
            name: `${item.name} (${flavorName})`,
            selectedSodaFlavor: { name: flavorName }
        };

        addItemToCart(newItem);
        sodaChoiceModal.classList.add('hidden');
        state.selectedItem = null;
    }

    // Abrir e fechar o modal do carrinho
    if (e.target.closest('#cart-button')) {
        updateCartView();
        cartModal.classList.remove('hidden');
    }
    if (e.target.closest('#close-cart-modal')) {
        cartModal.classList.add('hidden');
    }

    // Fechar modais de personalização
    if (e.target.closest('#close-size-choice-modal')) {
        sizeChoiceModal.classList.add('hidden');
        state.selectedItem = null;
    }
    if (e.target.closest('#close-protein-choice-modal')) {
        proteinChoiceModal.classList.add('hidden');
        sizeChoiceModal.classList.remove('hidden'); // Volta para o modal anterior
        state.selectedProtein = null;
    }
    if (e.target.closest('#close-toppings-choice-modal')) {
        toppingsChoiceModal.classList.add('hidden');
        proteinChoiceModal.classList.remove('hidden'); // Volta para o modal anterior
        state.selectedToppings = [];
    }
    if (e.target.closest('#close-sweet-toppings-choice-modal')) {
        sweetToppingsChoiceModal.classList.add('hidden');
        sizeChoiceModal.classList.remove('hidden'); // Volta para o modal anterior
        state.selectedSweetToppings = [];
    }
    if (e.target.closest('#close-soda-choice-modal')) {
        sodaChoiceModal.classList.add('hidden');
        state.selectedItem = null;
    }
    if (e.target.closest('#close-customize-modal')) {
        customizeModal.classList.add('hidden');
        sizeChoiceModal.classList.remove('hidden'); // Volta para o modal anterior
    }
    if (e.target.closest('#close-custom-toppings-modal')) {
        customToppingsModal.classList.add('hidden');
        customizeModal.classList.remove('hidden');
        state.selectedToppings = [];
    }


    // Abrir e fechar o modal de checkout
    if (e.target.closest('#checkout-button')) {
        cartModal.classList.add('hidden');
        if (state.isDelivery) {
            deliveryInfoDiv.classList.remove('hidden');
        } else {
            deliveryInfoDiv.classList.add('hidden');
        }
        checkoutModal.classList.remove('hidden');
        // Inicializa o estado do modal de checkout
        const currentTotal = parseFloat(document.getElementById('cart-total').textContent.replace('R$', ''));
        if (document.querySelector('input[name="payment-method"]:checked').value === 'PIX') {
            generatePixQRCode(currentTotal);
            pixInfoContainer.classList.remove('hidden');
            cardSubOptionsDiv.classList.add('hidden');
            moneyChangeOptionsDiv.classList.add('hidden');
        }
    }
    if (e.target.closest('#close-checkout-modal')) {
        checkoutModal.classList.add('hidden');
        resetCheckoutForm();
    }

    // Alterar quantidade no carrinho
    if (e.target.closest('.update-quantity-btn')) {
        const button = e.target.closest('.update-quantity-btn');
        const index = parseInt(button.dataset.index);
        const action = button.dataset.action;
        const item = state.cart[index];

        if (action === 'increase') {
            item.quantity++;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity--;
        }
        updateCartView();
    }

    // Remover item do carrinho
    if (e.target.closest('.remove-from-cart-btn')) {
        const button = e.target.closest('.remove-from-cart-btn');
        const index = parseInt(button.dataset.index);
        state.cart.splice(index, 1);
        updateCartView();
        showStatusMessage('Item removido do carrinho.');
    }

    // Enviar pedido para o WhatsApp
    if (e.target.closest('#send-whatsapp-button')) {
        const total = parseFloat(document.getElementById('cart-total').textContent.replace('R$', ''));
        let paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        const cardTypeRadio = document.querySelector('input[name="card-type"]:checked');
        const pixPayload = getPixPayload(total);

        if (paymentMethod === 'Cartões' && cardTypeRadio) {
            paymentMethod += ` - ${cardTypeRadio.value}`;
        }

        if (paymentMethod === 'Dinheiro') {
            const moneyValue = parseFloat(moneyValueInput.value);
            if (isNaN(moneyValue) || moneyValue < total) {
                showStatusMessage('O valor em dinheiro é insuficiente para o pagamento.', 'error');
                return;
            }
            const change = moneyValue - total;
            paymentMethod += ` (Troco para R$ ${moneyValue.toFixed(2)} - Troco de R$ ${change.toFixed(2)})`;
        }

        const deliveryAddress = document.getElementById('address').value;
        const clientPhone = document.getElementById('phone').value;

        let message = `Olá! Gostaria de fazer o seguinte pedido:\n\n*Pedido*\n`;

        state.cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2)})\n`;
            if (item.selectedSize) {
                message += `  > Tamanho: ${item.selectedSize.name}\n`;
            }
            if (item.selectedProtein) {
                message += `  > Proteína: ${item.selectedProtein}\n`;
            }
            if (item.selectedToppings && item.selectedToppings.length > 0) {
                message += `  > Toppings: ${item.selectedToppings.map(t => t.name).join(', ')}\n`;
            }
            if (item.selectedSweetToppings && item.selectedSweetToppings.length > 0) {
                message += `  > Coberturas: ${item.selectedSweetToppings.map(t => t.name).join(', ')}\n`;
            }
            if (item.selectedSodaFlavor) {
                message += `  > Sabor: ${item.selectedSodaFlavor.name}\n`;
            }
            if (item.ingredients) {
                message += `  > Ingredientes: ${item.ingredients.join(', ')}\n`;
            }
        });

        message += `\n*Forma de Pedido: ${state.isDelivery ? 'Entrega' : 'Retirada'}*\n`;
        if (state.isDelivery) {
            message += `*Taxa de Entrega: R$ ${state.deliveryFee.toFixed(2)}*\n`;
            message += `*Endereço de Entrega: ${deliveryAddress}*\n`;
            message += `*Telefone: ${clientPhone}*\n`;
        }

        message += `\n*Total: R$ ${total.toFixed(2)}*\n`;
        message += `*Forma de Pagamento: ${paymentMethod}*\n`;

        // Adiciona o código Pix para Copia e Cola, se o método for Pix
        if (paymentMethod.startsWith('PIX')) {
            message += `\n*Pix Copia e Cola:*\n${pixPayload}\n`;
        }


        const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Limpa o carrinho e fecha o modal
        state.cart = [];
        updateCartView();
        checkoutModal.classList.add('hidden');
        resetCheckoutForm();
    }

    // Opções de entrega/retirada
    if (e.target.closest('#delivery-option')) {
        state.isDelivery = true;
        deliveryOptionBtn.classList.add('bg-red-500', 'text-white', 'hover:bg-red-600', 'rounded-lg');
        deliveryOptionBtn.classList.remove('bg-red-400', 'hover:bg-red-500');
        pickupOptionBtn.classList.add('bg-red-400', 'hover:bg-red-500', 'rounded-lg');
        pickupOptionBtn.classList.remove('bg-red-500', 'text-white', 'hover:bg-red-600');
        updateCartView();
        showStatusMessage('Opção de Entrega selecionada. Taxa de R$ 5.00 será adicionada.');
    }
    if (e.target.closest('#pickup-option')) {
        state.isDelivery = false;
        pickupOptionBtn.classList.add('bg-red-500', 'text-white', 'hover:bg-red-600', 'rounded-lg');
        pickupOptionBtn.classList.remove('bg-red-400', 'hover:bg-red-500');
        deliveryOptionBtn.classList.add('bg-red-400', 'hover:bg-red-500', 'rounded-lg');
        deliveryOptionBtn.classList.remove('bg-red-500', 'text-white', 'hover:bg-red-600');
        updateCartView();
        showStatusMessage('Opção de Retirada selecionada. Sem taxa adicional.');
    }

    // Alternar entre as abas
    if (e.target.closest('#salgados-tab')) {
        showTab('salgados-menu');
    }
    if (e.target.closest('#doces-tab')) {
        showTab('doces-menu');
    }
    if (e.target.closest('#bebidas-tab')) {
        showTab('bebidas-menu');
    }
    if (e.target.closest('#combos-tab')) {
        showTab('combos-menu');
    }

    // Lógica para selecionar a opção de pagamento e ativar a classe 'active' e mostrar as sub-opções
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    pixInfoContainer.classList.add('hidden');
    cardSubOptionsDiv.classList.add('hidden');
    moneyChangeOptionsDiv.classList.add('hidden');

    if (paymentMethod === 'PIX') {
        pixInfoContainer.classList.remove('hidden');
        const currentTotal = parseFloat(document.getElementById('cart-total').textContent.replace('R$', ''));
        generatePixQRCode(currentTotal);
    } else if (paymentMethod === 'Cartões') {
        cardSubOptionsDiv.classList.remove('hidden');
    } else if (paymentMethod === 'Dinheiro') {
        moneyChangeOptionsDiv.classList.remove('hidden');
    }

    const paymentOptionContainer = e.target.closest('.payment-options-container > div');
    if (paymentOptionContainer) {
        document.querySelectorAll('.payment-options-container > div').forEach(div => div.classList.remove('active'));
        paymentOptionContainer.classList.add('active');
    }
});

// Listener para o campo de valor do dinheiro
moneyValueInput.addEventListener('input', () => {
    const total = parseFloat(document.getElementById('cart-total').textContent.replace('R$', ''));
    const moneyValue = parseFloat(moneyValueInput.value);

    if (!isNaN(moneyValue) && moneyValue >= total) {
        const change = moneyValue - total;
        changeValueP.textContent = `Troco a ser devolvido: R$ ${change.toFixed(2)}`;
        changeValueP.classList.remove('text-red-500');
    } else if (!isNaN(moneyValue) && moneyValue < total) {
        changeValueP.textContent = 'Valor insuficiente!';
        changeValueP.classList.add('text-red-500');
    } else {
        changeValueP.textContent = '';
    }
});

// Adiciona um listener para o modal de checkout para impedir o fechamento em cliques internos
checkoutModal.addEventListener('click', (e) => {
    if (e.target.closest('#close-checkout-modal')) {
        checkoutModal.classList.add('hidden');
        resetCheckoutForm();
        return;
    }
    if (e.target === checkoutModal) {
        checkoutModal.classList.add('hidden');
        resetCheckoutForm();
        return;
    }
    // Lógica para alternar a classe 'active' ao clicar em um contêiner de pagamento
    const paymentOptionContainer = e.target.closest('.payment-options-container > div');
    if (paymentOptionContainer) {
        document.querySelectorAll('.payment-options-container > div').forEach(div => div.classList.remove('active'));
        paymentOptionContainer.classList.add('active');
    }
});

// Listener para os inputs de rádio, para alternar a classe 'active' e mostrar sub-opções
document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        // Remove a classe 'active' de todos
        document.querySelectorAll('.payment-options-container > div').forEach(div => div.classList.remove('active'));
        // Adiciona a classe 'active' no elemento pai do radio clicado
        e.target.closest('.payment-options-container > div').classList.add('active');

        // Esconde todas as sub-opções
        pixInfoContainer.classList.add('hidden');
        cardSubOptionsDiv.classList.add('hidden');
        moneyChangeOptionsDiv.classList.add('hidden');

        const selectedPaymentMethod = e.target.value;
        if (selectedPaymentMethod === 'PIX') {
            pixInfoContainer.classList.remove('hidden');
            const currentTotal = parseFloat(document.getElementById('cart-total').textContent.replace('R$', ''));
            generatePixQRCode(currentTotal);
        } else if (selectedPaymentMethod === 'Cartões') {
            cardSubOptionsDiv.classList.remove('hidden');
        } else if (selectedPaymentMethod === 'Dinheiro') {
            moneyChangeOptionsDiv.classList.remove('hidden');
        }
    });
});

// Listener para o botão de copiar a chave Pix
copyPixKeyButton.addEventListener('click', () => {
    const currentTotal = parseFloat(document.getElementById('cart-total').textContent.replace('R$', ''));
    const payload = getPixPayload(currentTotal);

    document.execCommand('copy');
    showStatusMessage('Chave Pix copiada para a área de transferência!');
});

// Inicializa a aplicação e registra o Service Worker
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    updateCartView();
    showTab('salgados-menu');

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const repoName = '/tachitte';
            const swPath = `${repoName}/service-worker.js`;
            const manifestPath = `${repoName}/manifest.json`;

            // Altera o caminho do manifesto
            document.querySelector('link[rel="manifest"]').href = manifestPath;

            navigator.serviceWorker.register(swPath, { scope: repoName + '/' })
                .then(reg => {
                    console.log('Service Worker registrado com sucesso. Escopo: ' + reg.scope);
                }).catch(error => {
                    console.log('Falha no registro do Service Worker: ' + error);
                });
        });
    }
});