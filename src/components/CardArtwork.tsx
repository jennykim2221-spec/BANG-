import { artwork } from '../content/artwork';
export function CardArtwork({id,title,thumbnail=false}:{id:string;title:string;thumbnail?:boolean}) {
 const image=artwork[id];
 if(!image)return null;
 return <img className={thumbnail?'card-thumbnail':'card-artwork'} src={image.src} alt={thumbnail?'':`${title} 실제 카드 앞면`} loading={thumbnail?'lazy':'eager'} />;
}

