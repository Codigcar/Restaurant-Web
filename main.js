
let mealsState =[]

/* funcion para convertir el string a HTML y convertido a HTML se pueda seleccionar 
ya que todo los elementos html tiene EVENTOS*/
const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html') /* creando #documento html */
    return doc.body.firstChild /* retorna el primer elemento dentro de la etiqueta body */
}

const renderItem = (item) => {
    const element = stringToHTML(`<li data-id="${item._id}">${item.name}</li>`)
    /* todos los elementos HTML tienen eventos */
    element.addEventListener('click', () => {
        const mealsList = document.getElementById('meals-list')
        /* convertiendo en Array para recorrrelo y eliminar todo los selected */
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'));
        /* agregando una class="selected" al html */
        element.classList.add('selected')
        /* guardando "id de la comida" en el input type hidden */
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
    })
    return element;
}

const renderOrder = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id) /*'find' es un método de un array */
    const element = stringToHTML(`<li data-id="${order._id}">${meal.name} - ${order.user_id} </li>`)
    return element
}
window.onload = () => {

    const orderForm = document.getElementById('order-form')
    orderForm.onsubmit = (e) => {
        e.preventDefault() /* evitar que se refrese la pag al presionar el boton */
        const mealId = document.getElementById('meals-id')
        const mealIdValue =  mealId.value
        /* mientras cargar el boton deberá estar deshabilitado */
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        
        if (!mealIdValue) {
            alert('mealIdValue no existe, debe seleccionar un plato')
            return
        }

        /* creando objeto - construyendo orden */
        const order = {
            meal_id: mealIdValue,
            user_id: 'chanchito feliz'
        }

        fetch('https://custom-build-topaz.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json', /* para que el servidor sepa que se envia un json */
            },
            body: JSON.stringify(order)
        }).then(x => /* console.log(x) */ x.json()) /* x.json -> solo traera la informacion de tipo json porque hay varios tipos */
            .then(respuesta => {
                /* console.log(respuesta) */
                const renderedOrder = renderOrder(respuesta, mealsState)
                const ordersList = document.getElementById('orders-list')
                ordersList.appendChild(renderedOrder)
                /* termina de agregar los elementos y el boton se habilita */
                submit.removeAttribute('disabled')

            })



    }

    fetch('https://custom-build-topaz.vercel.app/api/meals')
        .then(resp => resp.json())
        .then(data => {
            mealsState = data
            const mealsList = document.getElementById('meals-list')
            const submit = document.getElementById('submit')

            /* const template = data.map(x => '<li>' + x.name + '</li>').join('') */ /* remmplazado x renderItem */
            /* const template = data.map(renderItem).join('') */
            const listItem = data.map(renderItem)
            mealsList.removeChild(mealsList.firstElementChild) /* eliminar text "cargando.."" */
            listItem.forEach(element => {
                mealsList.appendChild(element)
            });
            /* mealsList.innerHTML = template */
            submit.removeAttribute('disabled')

            fetch('https://custom-build-topaz.vercel.app/api/orders')
            .then(resp => resp.json())
            .then(ordersData => {
                const ordersList = document.getElementById('orders-list')
                const listOrders = ordersData.map(orderData => renderOrder(orderData, data ))
                /* eliminar el 'cargando...' */
                ordersList.removeChild(ordersList.firstElementChild) 
                listOrders.forEach(element => ordersList.appendChild(element))
                console.log(ordersData);
            })
        })
}