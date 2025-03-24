//funções assíncronas retornam promises, quando a um erro na função siginifica que a promise foi rejeitada
module.exports = fn => {
    return (req, res, next) =>{
      fn(req, res, next).catch(next) //O Express já entende que quando você chama next(err), ele deve passar o erro para o seu middleware de erro global.
    }
  }