module.exports = {
    delay : 
        async function delay(ms) {
            return new Promise (res => setTimeout(res, ms));
        }
}