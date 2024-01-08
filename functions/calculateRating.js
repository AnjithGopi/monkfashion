
async function calculateRating(data){

    const totalRating = data.reduce((sum, item) => {
        sum += item.rating
        return sum
    }, 0);
    const averageRating = totalRating / data.length;
    
  return averageRating

   

}

module.exports = {calculateRating}