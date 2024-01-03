
const loadContact = async (req, res) => {
    try {
       res.render('../pages/contact') 
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadContact
}