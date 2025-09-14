# **Tachitte: Sistema de Pedidos PWA**

Bem-vindo ao Tachitte, um aplicativo de pedidos PWA (Progressive Web App) para o restaurante fictício Tachitte. Este projeto foi desenvolvido para demonstrar um sistema de pedidos simples e eficiente, com a capacidade de ser instalado em dispositivos móveis e funcionar offline.

## **Visão Geral**

O aplicativo permite que os clientes naveguem pelo menu, adicionem itens a um carrinho de compras e finalizem o pedido. O destaque é a integração com o WhatsApp para envio do pedido e a geração de um QR Code Pix dinâmico para pagamentos instantâneos.

### **Principais Funcionalidades**

* **Menu Interativo**: Navegue por categorias de produtos (salgados, doces e bebidas).  
* **Opção de Customização**: Crie seu próprio "tachitte" salgado com até 5 ingredientes.  
* **Carrinho de Compras**: Adicione, remova e ajuste a quantidade de itens no seu pedido.  
* **Escolha de Pedido**: Selecione entre as opções de **Entrega** (com taxa adicional) ou **Retirada** no local.  
* **Modal de Pagamento**: Escolha a forma de pagamento (Pix, Cartões ou Dinheiro) e visualize as opções.  
* **Geração de QR Code Pix**: Gera um QR Code Pix estático e uma chave Pix Copia e Cola, com um identificador de transação único para cada pedido.  
* **Envio por WhatsApp**: O pedido completo, incluindo detalhes de entrega e pagamento, é formatado e enviado diretamente para o WhatsApp do restaurante.  
* **PWA (Progressive Web App)**: Pode ser instalado na tela inicial do seu dispositivo e funciona de forma otimizada.  
* **Design Responsivo**: O layout se adapta perfeitamente a dispositivos móveis, tablets e desktops, usando Tailwind CSS.

## **Tecnologias Utilizadas**

* **HTML5**: Estrutura da aplicação.  
* **Tailwind CSS**: Framework para estilos e design responsivo.  
* **JavaScript (ES Modules)**: Toda a lógica e interatividade do aplicativo.  
* **QRCode.js**: Biblioteca para a geração do QR Code a partir do payload.  
* **Service Worker**: Gerencia o cache para permitir o uso offline.  
* **Manifest.json**: Arquivo de configuração que define o PWA.

## **Como Funciona a Chave Pix**

A chave Pix é gerada dinamicamente com base no valor total do pedido e nos dados do restaurante. O código JavaScript do projeto constrói o payload EMV Pix do zero, incluindo:

* Chave Pix do restaurante.  
* Nome e cidade do recebedor.  
* Valor total da transação.  
* Um **identificador de transação (TXID)** único, gerado a partir do timestamp, que permite a identificação do pedido no sistema bancário.

Isso garante que cada QR Code seja válido e que a transação possa ser facilmente rastreada, eliminando o problema do identificador \*\*\* em pagamentos.

## **Estrutura do Projeto**

* index.html: Arquivo principal da aplicação, contendo a estrutura HTML, estilos e o código JavaScript.  
* data.js: Arquivo que armazena os dados do menu e as configurações do restaurante.  
* service-worker.js: Script para o Service Worker, responsável por gerenciar o cache.  
* manifest.json: Arquivo de manifesto para o PWA.  
* images/: Diretório com as imagens dos produtos.  
* icons/: Diretório com os ícones do aplicativo.