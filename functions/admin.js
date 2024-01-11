function getSalesReportCounts(orderData){

    var uniqueDocuments = new Map();

        // Iterate through the array and add each document to the map using _id as the key
        orderData.forEach(doc => {
        uniqueDocuments.set(doc._id.toString(), doc);
        });

        // Convert the map values back to an array to get distinct documents
        let distinctDocuments = Array.from(uniqueDocuments.values());
     

    console.log("Order Data :",orderData)
                  
        const filterPaymentOnline = distinctDocuments.filter(obj => obj.paymentMethod === "Online");
        const filterPaymentOffline = distinctDocuments.filter(obj => obj.paymentMethod === "Cash On Delivery");
        const filterOrderWallet = distinctDocuments.filter(obj => obj.paymentMethod === "Wallet");
        const totalSum = distinctDocuments.reduce((sum,obj) => {
        return sum+=obj.totalAmount
        },0)

    
        let salesData={
            filterPaymentOnline:filterPaymentOnline.length,
            filterPaymentOffline:filterPaymentOffline.length,
            filterPaymentWallet:filterOrderWallet.length,
            totalSum:totalSum
        }
        return salesData
    }

module.exports = { getSalesReportCounts }