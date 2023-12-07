
    function addProductToCart(productId){
        console.log("add product worked")
        console.log("Product ID",productId)

   
            fetch(`/user/addToCart/${productId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(response => response.json())
            .then(data => {
                console.log(data)
                console.log("Product data",data.productData)
                console.log("Product Quantity :",data.cartQuantity)
                console.log("Response received")
                if (data.success) {
                    // toastr.success("Added to cart")
                toastr.success(data.message)
                // console.log("added to cart")
        
                }else {
                    
                    // console.log("added to car t  warning")

                    toastr.warning(data.warningMessage)
                    // toastr.warning('warnning ')
                
            }
            document.getElementById("cartQuantityIcon").innerHTML = data.cartQuantity
            document.getElementById("cartQuantityIconMobile").innerHTML = data.cartQuantity
           
                
            })
            .catch(error => {
                // Handle errors during the fetch
                console.error('Fetch error:', error);
            });
       
        
    }
