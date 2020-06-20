// import Path from 'path';
import Fs from 'fs';
import Fse from 'fs-extra';
import Axios from 'axios';
import Head from "next/head";

export default function Home(props) {
  // console.log(props.products, 'ini props.products')
  // console.log(props.products.length)
  return (
    <React.Fragment>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head> 
      <div className="container m-auto">
      <h1 className='text-3xl font-bold pb-8'>Iyu Bazaar</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {props.products.map(val => {

            return (
              <div key={val._id} className='rounded-lg shadow-lg p-5'>
              <div>
                <img src={`/${val.image}`} className='h-48 w-full' />
              </div>
              <div className='mt-auto' >{val.name}</div>
            <div>Rp{val.price}</div>
            </div>
            )
            
          })}
        </div>
      </div>
      </React.Fragment>
    
  )
}

export async function getStaticProps() {
  const res = await fetch("https://backend-product-minimarket.herokuapp.com/product/get-product");
  const products = await res.json();


  async function downloadImage(uri){
    console.log(uri, 'uri')
    const url = `http://backend-product-minimarket.herokuapp.com/${uri}`;
    const urlSplit = url.split('/');
    // console.log(urlSplit, 'urlsplit')
    const imageName = urlSplit[urlSplit.length - 1];
    console.log(imageName, 'imagename')

    const exists = await new Promise((resolve) => {
      Fs.access(`./public/${imageName}`, (err) => {
        if (err) resolve(0);
        else resolve(1);
      });
    });
    console.log(exists);

    if (exists) return;
    
    // const path = Path.resolve('', 'images', 'code.jpg')
    const writer = Fs.createWriteStream(`./public/${imageName}`);

  const response = await Axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }
  await Promise.all(products.map(val => {
    return downloadImage(val.image);
  }));
  
    

    // Check if Image Not Exists
    const herokuImages = [...new Set(products.map(val => val.image.replace('image/', '')))];
    let files = await Fse.readdir('./public');
    files = files.filter(val => /jpg$/.test(val) && !herokuImages.includes(val));
    
    await Promise.all(files.map(val => {
      return Fse.remove(`./public/${val}`);
    }))
    

    return {
      props: { 
        products: products.map(val => {
          const image = val.image.split('/')[1];
          return {
            ...val,
            image
          }
        })
       },
    };
}
