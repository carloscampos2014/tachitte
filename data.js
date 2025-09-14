// Dados do menu e configurações do restaurante
export const menuData = {
    tachittes: [
        { id: 't1', name: 'Tradicional', description: 'Uma explosão de sabor com nossa base tradicional: arroz, alga, cenoura e proteína (peixe ou carne).', price: 15.00, img: 'images/tradicional.png', type: 'salty' },
        { id: 't2', name: 'Bacon', description: 'A nossa receita clássica de tachitte com a irresistível adição de fatias crocantes de bacon.', price: 18.00, img: 'images/bacon.png', type: 'salty' },
        { id: 't3', name: 'Pepperone', description: 'Um toque picante e defumado com a nossa receita padrão e generosas fatias de pepperoni.', price: 18.00, img: 'images/pepperone.png', type: 'salty' },
        { id: 't4', name: 'Salsicha', description: 'Saboroso e reconfortante: o tachitte tradicional com fatias de salsicha.', price: 17.00, img: 'images/salsicha.png', type: 'salty' },
        { id: 't5', name: 'Queijo', description: 'Para os amantes de queijo: a receita padrão com mussarela derretida e picada por toda parte.', price: 17.00, img: 'images/queijo.png', type: 'salty' },
        { id: 't6', name: 'Vegano', description: 'Nossa opção deliciosa e 100% à base de plantas. Leca arroz integral, algas, cenoura e tofu no lugar da proteína animal.', price: 19.00, img: 'images/vegano.png', type: 'salty' },
        { id: 't7', name: 'Romeu e Julieta', description: 'Um clássico reinventado! A base de tachitte salgada encontra a doçura da goiabada e o sabor suave do queijo mussarela.', price: 16.00, img: 'images/romeu-e-julieta.png', type: 'sweet' },
        { id: 't8', name: 'Chocolate', description: 'O paraíso para os apaixonados por doces. O tachitte tradicional com um recheio generoso de chocolate ao leite ou branco.', price: 18.00, img: 'images/chocolate.png', type: 'sweet' },
        { id: 't9', name: 'Caramelo', description: 'Uma combinação surpreendente de sabores! A nossa receita clássica finalizada com a doçura e textura do caramelo.', price: 18.00, img: 'images/caramelo.png', type: 'sweet' },
        { id: 't10', name: 'Customizado', description: 'Liberte sua criatividade! Monte seu próprio tachitte único com até 5 ingredientes da sua escolha.', price: 20.00, img: 'images/customizado.png', isCustom: true, type: 'salty' }
    ],
    bebidas: [
        { id: 'b1', name: 'Suco de Laranja', description: 'Suco natural de laranja.', price: 7.00, img: 'images/suco-laranja.png', type: 'suco' },
        { id: 'b2', name: 'Suco de Limão', description: 'Suco natural de limão.', price: 7.00, img: 'images/suco-limao.png', type: 'suco' },
        { id: 'b3', name: 'Suco de Tangerina', description: 'Suco natural de tangerina.', price: 7.00, img: 'images/suco-tangerina.png', type: 'suco' },
        { id: 'b4', name: 'Suco de Morango', description: 'Suco natural de morango.', price: 8.00, img: 'images/suco-morango.png', type: 'suco' },
        { id: 'b5', name: 'Suco de Maçã', description: 'Suco natural de maçã.', price: 8.00, img: 'images/suco-maca.png', type: 'suco' },
        { id: 'b6', name: 'Suco de Uva', description: 'Suco natural de uva.', price: 8.00, img: 'images/suco-uva.png', type: 'suco' },
        { id: 'b7', name: 'Refrigerante Lata', description: 'Refrigerante em lata.', price: 6.00, img: 'images/refri-lata.png', type: 'refri' },
        { id: 'b8', name: 'Refrigerante 600ml', description: 'Refrigerante garrafa 600ml.', price: 8.00, img: 'images/refri-600ml.png', type: 'refri' },
        { id: 'b9', name: 'Refrigerante 2L', description: 'Refrigerante garrafa 2 litros.', price: 12.00, img: 'images/refri-2l.png', type: 'refri' }
    ],
    ingredientes: [
        { id: 'i1', name: 'Algas' }, { id: 'i2', name: 'Arroz' }, { id: 'i3', name: 'Cenoura' },
        { id: 'i4', name: 'Peixe' }, { id: 'i5', name: 'Carne' }, { id: 'i6', name: 'Tofu' },
        { id: 'i7', name: 'Bacon' }, { id: 'i8', name: 'Pepperone' }, { id: 'i9', name: 'Salsicha' },
        { id: 'i10', name: 'Queijo' }, { id: 'i11', name: 'Goiabada' }, { id: 'i12', name: 'Chocolate' },
        { id: 'i13', name: 'Caramelo' }
    ]
};

// Configurações do App
export const settings = {
    whatsappNumber: '11996747477', // Substitua pelo seu número de telefone do WhatsApp
    deliveryFee: 5.00,
    pixKey: '+5511996747477', // Substitua pela sua chave pix (pode ser e-mail, telefone, CPF/CNPJ, etc.)
    pixName: 'Carlos Campos',
    pixCity: 'Guarulhos'
};
