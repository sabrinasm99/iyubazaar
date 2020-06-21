// import Path from 'path';
// import Fs from 'fs';
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
  const posts = await res.json();

  async function downloadImage (uri) {  
    const url = `https://backend-product-minimarket.herokuapp.com/${uri}`;
    // const path = Path.resolve('./')
    const imageName = uri.replace(/.+\/(.+?\.(jpeg|jpg)$)/, '$1');

    const exists = await new Promise(resolve => Fse.access(`./public/${imageName}`, err => {
      if (err) resolve(0);
      else resolve(1);
    }));

    if (exists) return;
    


    const writer = Fse.createWriteStream(`./public/${imageName}`);
  
    const response = await Axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
    
    // console.log(response.data)
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }
 
  await Promise.all(posts.map(val => {
    return downloadImage(val.image);
  }));
  
  const cdnImages = posts.map(val => val.image.replace(/.+\/(.+?\.(jpeg|jpg)$)/, '$1'));
  const file = (await Fse.readdir('./public')).filter(val => /\.(jpeg|jpg)$/.test(val) && !cdnImages.includes(val));

  await Promise.all(file.map(val => {
    return Fse.remove(`./public/${val}`);
  }));
 

    return {
      props: { 
        products: posts.map(val => {
          const image = val.image.split('/')[1];
          return {
            ...val,
            image
          }
        })
       },
    };
}
