document.addEventListener('DOMContentLoaded', () => {

    const ORDER_SERVICE_API = 'http://localhost:3003';
  
  
    const userSelect = document.getElementById('user-select');
    const productSelect = document.getElementById('product-select');
    const userFilter = document.getElementById('user-filter');
    const ordersList = document.getElementById('orders-list');
    const orderForm = document.getElementById('order-form');
    const addProductBtn = document.getElementById('add-product-btn');
    const cartList = document.getElementById('cart-list');
    const productQuantity = document.getElementById('product-quantity');
  
    let cart = []; // Carrito temporal
  
    // Funciones de Carga de Datos 
  
    async function loadUsers() {
      try {
        const response = await fetch(`${ORDER_SERVICE_API}/orders/proxy/users`);
        const users = await response.json();
        
        userSelect.innerHTML = ''; 
        userFilter.innerHTML = '<option value="">Todos los Usuarios</option>'; 
        
        users.forEach(user => {
          const option = `<option value="${user.id}">${user.name} (${user.email})</option>`;
          userSelect.innerHTML += option;
          userFilter.innerHTML += option;
        });
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    }
  
    async function loadProducts() {
      try {
        const response = await fetch(`${ORDER_SERVICE_API}/orders/proxy/products`);
        const products = await response.json();
        
        productSelect.innerHTML = ''; 
        
        products.forEach(product => {
          if (product.stock > 0) { 
            const option = `<option value="${product.id}" data-name="${product.name}" data-price="${product.price}">
                              ${product.name} - $${product.price} (Stock: ${product.stock})
                            </option>`;
            productSelect.innerHTML += option;
          }
        });
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    }
  
    async function loadOrders() {
      try {
        let url = `${ORDER_SERVICE_API}/orders`;
        const selectedUserId = userFilter.value;
  
        if (selectedUserId) {
          url += `?userId=${selectedUserId}`;
        }
  
        const response = await fetch(url);
        const orders = await response.json();
        
        ordersList.innerHTML = ''; 
        
        if (orders.length === 0) {
          ordersList.innerHTML = '<p>No se encontraron órdenes.</p>';
          return;
        }
  
        orders.forEach(order => {

          const itemsHtml = order.items.map(item => 
            `<li>${item.quantity} x ${item.productName} $${item.price}</li>`
          ).join('');
  
          const orderHtml = `
            <div class="order">
              <h3>Orden #${order.id} (Usuario ID: ${order.user_id})</h3>
              <p><strong>Total:</strong> $${order.total_price}</p>
              <p><strong>Estado:</strong> ${order.status}</p>
              <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Items:</strong></p>
              <ul>${itemsHtml}</ul>
            </div>
          `;
          ordersList.innerHTML += orderHtml;
        });
  
      } catch (error) {
        console.error('Error al cargar órdenes:', error);
      }
    }
  
    function renderCart() {
      cartList.innerHTML = ''; 
  
      if (cart.length === 0) {
        cartList.innerHTML = '<li>El carrito está vacío</li>';
        return;
      }
  
      cart.forEach((item, index) => {
        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
          ${item.quantity} x ${item.productName}
          <button type="button" class="remove-btn" data-index="${index}">X</button>
        `;
        cartList.appendChild(cartItem);
      });
    }
  

  
    // Añadir producto al carrito 
    addProductBtn.addEventListener('click', () => {
      const selectedOption = productSelect.options[productSelect.selectedIndex];
      const productId = parseInt(productSelect.value);
      const productName = selectedOption.dataset.name;
      const quantity = parseInt(productQuantity.value);
  
      if (!productId || quantity <= 0) {
        alert('Selecciona un producto y una cantidad válida.');
        return;
      }
  

      // Revisa si el producto ya está en el carrito
      const existingItem = cart.find(item => item.productId === productId);
  
      if (existingItem) {
        // Si existe, solo suma la cantidad
        existingItem.quantity += quantity;
      } else {
        // Si no existe, añádelo al carrito
        cart.push({ productId, quantity, productName });
      }
   
      
      // Llama a la función de renderizado
      renderCart();
  
      productQuantity.value = 1;
    });
  
    // Event Listener para los botones de eliminar
    cartList.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-btn')) {
        const index = parseInt(e.target.dataset.index);
        cart.splice(index, 1);
        renderCart();
      }
    });
  
  
    // Crear la orden 
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault(); 
  
      const userId = parseInt(userSelect.value);
      
      if (!userId || cart.length === 0) {
        alert('Debes seleccionar un usuario y añadir productos al carrito.');
        return;
      }
  
      const orderData = {
        userId: userId,
        products: cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
      };
  
      try {
        const response = await fetch(`${ORDER_SERVICE_API}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear la orden');
        }
  
        const result = await response.json();
        alert(`¡Orden creada exitosamente! ID: ${result.orderId}`);
  
        // Limpiar formulario y carrito
        cart = [];
        renderCart(); 
        
        // Recargar todo
        loadProducts();
        loadOrders();
  
      } catch (error) {
        console.error('Error en creación de orden:', error);
        alert(`Error: ${error.message}`);
      }
    });
  
    // Filtrar ordenes al cambiar el filtro de usuario
    userFilter.addEventListener('change', loadOrders);
  
   
    function init() {
      loadUsers();
      loadProducts();
      loadOrders();
      renderCart(); 
    }
  
    init();
  });