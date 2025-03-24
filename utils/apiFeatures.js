class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    console.log(queryObj);
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    //1b) Advenced filtering, expressões regulares
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //o b significa que as palavras precisam ser exatas e não só conter os caracteres especificados
    // o g significa que será analisado todas strings,não irá parar na rpimeira q for match
    //o parametro match representa a string q foi achada

    console.log('Query modificada:', queryStr);

    this.query = this.query.find(JSON.parse(queryStr));
    //const modifiedQueryObj = Tour.find(JSON.parse(queryStr)); //o objeto retornado é uma instância da classe query, que contém todos os documentos q atendem os parâmetor passados pro método find. A partir desse objeto podemos chamar outros, como o sort.
    return this;
  }

  sort() {
    //1c) Sorting
    if (this.queryString.sort) {
      // Cria um objeto de ordenação a partir da string de `sort`
      const sortBy = this.queryString.sort.split(',').reduce((acc, field) => {
        // Verifica se o campo começa com "-" (decrescente) ou não (crescente)
        const direction = field.startsWith('-') ? -1 : 1;
        const fieldName = field.replace('-', ' '); // Remove o sinal "-" se presente
        acc[fieldName] = direction;
        return acc;
      }, {});

      // Aplica a ordenação no Mongoose
      this.query = this.query.sort(sortBy);
      console.log(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
      console.log('teste');
    }
    return this;
  }

  limitFields() {
    //3) Field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      console.log(`antes: ${this.queryString.fields}`);
      this.query = this.query.select(fields);
      console.log(`depois: ${fields}`);
    } else {
      this.query = this.query.select('-__v'); //vai selecionar todos os campos menos o '__v'
    }
    return this;
  }

  paginate() {
    //4)pagination
    const page = this.queryString.page * 1 || 1; //converte em string em number ou define a pag em 1
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
  }
}
module.exports = APIFeatures;
