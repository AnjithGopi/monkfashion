function getSalesReportCounts(orderData){
    // console.log("Order Data :",orderData)
                  
        const filterPaymentOnline = orderData.filter(obj => obj.paymentMethod === "Online");
        const filterPaymentOffline = orderData.filter(obj => obj.paymentMethod === "Cash On Delivery");
        const filterOrderCancelled = orderData.filter(obj => obj.orderStatus === "Cancelled");
        const totalSum = orderData.reduce((sum,obj) => {
        return sum+=obj.totalAmount
        },0)

        console.log(filterPaymentOnline.length);
        console.log(filterPaymentOffline.length);
        console.log(filterOrderCancelled.length);
        console.log(totalSum)
        let salesData={
            filterPaymentOnline:filterPaymentOnline.length,
            filterPaymentOffline:filterPaymentOffline.length,
            filterOrderCancelled:filterOrderCancelled.length,
            totalSum:totalSum
        }
        return salesData
    }

module.exports = { getSalesReportCounts }