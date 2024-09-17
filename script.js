const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItensContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCount = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");

// Mapeamento dos métodos de pagamento
const paymentMethodNames = {
    'credit': 'Cartão de Crédito',
    'debit': 'Cartão de Débito',
    'cash': 'Dinheiro'
};

let cart = [];

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function() {
    updateCartModal();
    cartModal.style.display = "flex";
});

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", function(event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

closeModalBtn.addEventListener("click", function() {
    cartModal.style.display = "none";
});

menu.addEventListener("click", function(event) {
    let parentButton = event.target.closest(".add-to-cart-btn");
    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        addToCart(name, price);
    }
});

// Função para adicionar no carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        });
    }
    updateCartModal();
}

// Atualiza o carrinho
function updateCartModal() {
    cartItensContainer.innerHTML = "";
    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-6", "flex-col");

        cartItemElement.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <p class="font-bold">${item.name}</p>
            <p>Qtd: ${item.quantity}</p>
            <p class="font-medium mt-3">R$ ${(item.price * item.quantity).toFixed(2)}</p>
          </div>
          <button class="remove-from-cart-btn text-red-500 hover:text-red-700" data-name="${item.name}">
            Remover
          </button>
        </div>
        `;

        total += item.price * item.quantity;
        totalItems += item.quantity;
        cartItensContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    cartCount.innerHTML = totalItems;
}

// Função para remover o item do carrinho
cartItensContainer.addEventListener("click", function(event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const Index = cart.findIndex(item => item.name === name);
    if (Index !== -1) {
        const item = cart[Index];
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(Index, 1);
        }
        updateCartModal();
    }
}

addressInput.addEventListener("input", function(event) {
    let inputValue = event.target.value;
    if (inputValue !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
    }
});

// Seletores de elementos
const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
const cashChangeField = document.getElementById('cash-change');
const changeInput = document.getElementById('change-value');

// Evento para mostrar ou esconder o campo de troco
paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
        if (this.value === 'cash') {
            cashChangeField.classList.remove('hidden'); 
        } else {
            cashChangeField.classList.add('hidden'); 
        }
    });
});

// Função que formata o valor como BRL (R$)
changeInput.addEventListener('input', function() {
    let value = this.value.replace(/\D/g, ''); // Remove tudo que não for dígito
    value = (value / 100).toFixed(2); // Divide por 100 para transformar em centavos
    value = value.replace('.', ','); // Substitui o ponto por vírgula
    this.value = `R$ ${value}`; // Adiciona o símbolo R$
});

// Finalizar pedido
checkoutBtn.addEventListener('click', function() {
    const isOpen = checkRestauntantOpen();
    if (!isOpen) {
        Toastify({
            text: "Ops, o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
        }).showToast();
        return;
    }

    if (cart.length === 0) return;
    
    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    // Montar o pedido
    const cartItems = cart.map(item => 
        `${item.name} - Quantidade: (${item.quantity}) - Preço Unitário: R$ ${(item.price).toFixed(2)}`
    ).join("\n");

    const total = cartTotal.textContent;
    const endereco = addressInput.value;
    const numero = document.getElementById('address-number').value;

    // Capturar a forma de pagamento
    const selectedPaymentMethodInput = document.querySelector('input[name="payment-method"]:checked');
    if (!selectedPaymentMethodInput) {
        alert('Por favor, selecione um método de pagamento.');
        return;
    }
    
    const paymentMethodValue = selectedPaymentMethodInput.value;
    const paymentMethodName = paymentMethodNames[paymentMethodValue] || 'Não especificado';
    let paymentMessage = `\n*Forma de Pagamento:* ${paymentMethodName}`;

    // Se o método de pagamento for "Dinheiro", incluir troco
    if (paymentMethodValue === 'cash') {
        const changeValue = document.getElementById('change-value').value.replace('R$ ', '').replace(',', '.');
        if (changeValue) {
            paymentMessage += `\n*Troco para:* R$ ${changeValue}`;
        }
    }

    // Montar a mensagem do WhatsApp
    const message = `*Pedido RedBurguer*\n\n*Itens do Pedido:*\n${cartItems}\n\n*Total:* ${total}\n\n*Endereço de Entrega:*\n${endereco}, Número: ${numero}\n${paymentMessage}`;

    const phone = "85992069566";
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // Abrir o WhatsApp com a mensagem preenchida
    window.open(whatsappUrl, "_blank");

    // Limpar o carrinho após o envio
    cart = [];
    updateCartModal();

    // Limpar os campos de endereço, número, CEP e pagamento
    addressInput.value = "";
    document.getElementById('address-number').value = "";
    document.getElementById('cep').value = ""; 
    changeInput.value = "";
});

// Verificar a hora e manipular o card do horário
function checkRestauntantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 21 && hora < 22; 
    // True = Hamburgueria aberta
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestauntantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
} else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
}

// PARTE NOVA DO CARRINHO
document.getElementById('cep').addEventListener('blur', function() {
    const cep = this.value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    mostrarAvisoDeErro();
                } else {
                    esconderAvisoDeErro();
                    preencherEndereco(data);
                }
            })
            .catch(() => {
                mostrarAvisoDeErro();
            });
    } else {
        mostrarAvisoDeErro();
    }
});

function mostrarAvisoDeErro() {
    document.getElementById('address-warn').classList.remove('hidden');
    document.getElementById('address').value = '';
    document.getElementById('address-number').value = '';
}

function esconderAvisoDeErro() {
    document.getElementById('address-warn').classList.add('hidden');
}

function preencherEndereco(data) {
    const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
    document.getElementById('address').value = endereco;
    // Presume-se que o número é um campo separado
    document.getElementById('address-number').focus();
}
