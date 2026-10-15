import {LabelledText} from "../components/LabelledText";
import { learningSession } from "../storage/learning-session";
import {boardPhoto} from "../content/board-photo";
import {useEffect,useRef,useState} from 'react';
import {CardArtwork} from '../components/CardArtwork';
import {Link} from '../app/router';
import {useRouter} from '../app/router-context';
import {progress,write} from '../storage/store';
const roles:Record<number,string>={4:'보안관 1 · 배신자 1 · 무법자 2',5:'보안관 1 · 배신자 1 · 무법자 2 · 부관 1',6:'보안관 1 · 배신자 1 · 무법자 3 · 부관 1',7:'보안관 1 · 배신자 1 · 무법자 3 · 부관 2'};
const titles=['상자를 열고 카드를 구분해요','생명력은 버틸 수 있는 횟수예요','역할 카드는 내 편과 목표예요','캐릭터 카드는 나만의 능력이에요','게임 카드는 손에 들고 사용하는 카드예요','인원을 정하고 자리를 준비해요','역할을 한 장씩 나눠요','캐릭터와 생명력을 받아요','중앙 카드와 손패를 준비해요'];
function Example({id,title,caption}:{id:string;title:string;caption:string}){return <figure><CardArtwork id={id} title={title}/><figcaption><strong>{title}</strong><br/>{caption}</figcaption></figure>}
function Tip({children}:{children:React.ReactNode}){return <p className="setup-important"><b aria-hidden="true">!</b>{children}</p>}

export function Setup(){
 const resumeSetup=learningSession.review?learningSession.reviewSetup:learningSession.setup;
 const[step,setStep]=useState(resumeSetup.step);const[count,setCount]=useState(resumeSetup.count);const heading=useRef<HTMLHeadingElement>(null);const{go,learningHome}=useRouter();
 useEffect(()=>{if(learningSession.review){learningSession.reviewSetup.step=step;learningSession.reviewSetup.count=count;}if(!learningSession.protectBookmark){learningSession.setup.step=step;learningSession.setup.count=count;}},[step,count]);
 const move=(next:number)=>{setStep(next);window.scrollTo(0,0);heading.current?.focus({preventScroll:true})};
 return <>
 <div className="section-line"><Link className="back-link" to={learningHome ? "/" : "/learn"}>{learningHome ? "‹ 홈으로" : "‹ 배우기"}</Link><span>게임을 준비해요 · {step+1}/9</span></div>
 <h1 ref={heading} tabIndex={-1}>{titles[step]}</h1>
 <div className="setup-body">
 {step===0&&<><p>카드는 세 종류예요. 먼저 종류별로 나누고, 아직 서로 섞지 마세요.</p><div className="setup-card-grid three"><Example id="sheriff" title="역할" caption="7장 · 내 목표"/><Example id="bart-cassidy" title="캐릭터" caption="16장 · 내 능력"/><Example id="bang" title="게임 카드" caption="80장 · 행동"/></div><section className="setup-info"><strong>상자 속 나머지 구성품</strong><p>개인 보드 7개<br/>총알 토큰 30개<br/>요약 카드 7장<br/>규칙서<br/>(총알 토큰이 종이에 붙어 있다면 먼저 떼어 주세요)</p></section></>}
 {step===1&&<><div className="setup-info"><small>ⓘ 생명력 안내</small><strong>생명력 1 = 총알 토큰 1개</strong><div className="bullet-example" aria-label="생명력 4의 표시 예시">{[1,2,3,4].map(n=><svg key={n} width="25" height="52" viewBox="0 0 25 52" aria-hidden="true"><path d="M4 17 Q4 4 12.5 2 Q21 4 21 17 V43 H4Z" fill="#cda45a" stroke="#765222" strokeWidth="2"/><path d="M3 43H22V49H3Z" fill="#aa7634"/></svg>)}</div><small>총알 토큰 모양의 설명용 그림 · 4개면 생명력 4</small></div><p>공격을 피하지 못해 피해 1을 받으면 토큰 1개를 중앙에 돌려놓아요. 회복하면 다시 1개를 받아요.</p><Tip>생명력이 0이 되면 보통 탈락해요. 마지막 생명력을 잃는 순간의 맥주 사용 등 예외는 ‘생명력’ 단원에서 안내해요.</Tip><p>총알은 실제 공격에 쓰는 물건이 아니에요. 공격할 때는 게임 카드 ‘뱅!’을 사용합니다.</p></>}
 {step===2&&<><p>역할 그림·이름을 확인하세요. 캐릭터와 별개로 한 장을 받아요.</p><div className="setup-card-grid"><Example id="sheriff" title="보안관" caption="무법자·배신자를 모두 탈락시키기"/><Example id="deputy" title="부관" caption="보안관을 돕고 같은 목표 달성하기"/><Example id="outlaw" title="무법자" caption="보안관을 탈락시키기"/><Example id="renegade" title="배신자" caption="마지막까지 혼자 살아남기"/></div><Tip>보안관만 역할을 공개해요. 다른 역할은 끝까지 비밀로 두세요.</Tip></>}
 {step===3&&<><div className="setup-card-grid"><Example id="bart-cassidy" title="바트 캐시디" caption="초기 생명력 4"/><Example id="paul-regret" title="폴 리그렛" caption="초기 생명력 3"/></div><div className="setup-info"><small>ⓘ 카드 읽는 방법</small><strong>이름 · 능력 설명 · 총알 표시를 봐요.</strong><p>카드의 총알 표시 개수가 시작 생명력이에요. 캐릭터 능력은 사람마다 다릅니다. 캐릭터 카드는 앞에 공개해 두며, 사용하는 게임 카드가 아니에요.</p></div><Link className="text-button" to="/characters?from=setup">캐릭터별 능력 보기 ›</Link></>}
 {step===4&&<><div className="setup-card-grid"><Example id="bang" title="갈색 카드" caption="사용하고 버림 더미에 놓아요"/><Example id="barrel" title="파란 카드" caption="사용하면 앞에 놓고 효과를 유지해요"/></div><div className="setup-info"><small>ⓘ 게임 카드 안내</small><p>공격·방어·회복·장비 등에 쓰는 80장이에요. 두 색을 함께 섞어 중앙 카드를 만듭니다. 손에 들고 다른 사람에게 보이지 않게 가진 게임 카드를 ‘손패’라고 해요.</p></div><Tip>처음부터 파란 카드를 설치하지 않아요. 먼저 손패로 받은 뒤, 자기 차례에 규칙에 맞게 사용해요. 감옥 등 설치 위치의 예외는 카드 설명에서 확인하세요.</Tip></>}
 {step===5&&<><p>4~7명이 서로의 앞에 놓인 카드를 볼 수 있게 원형으로 앉아요.</p><div className="choices" aria-label="게임 인원">{[4,5,6,7].map(n=><button key={n} aria-pressed={count===n} onClick={()=>setCount(n)}>{n}명</button>)}</div><div className="setup-info"><small>ⓘ 이번 게임에 쓸 역할 카드</small><strong>{roles[count]}</strong></div><p>각자 개인 보드를 앞에 놓아요. 보드의 역할·캐릭터·무기·총알 자리를 확인하세요.</p><figure className="real-board"><img src={boardPhoto} alt="개인 보드: 위쪽 총알 자리, 아래 역할 카드·인물 카드·무기 카드 자리" width="404" height="273" style={{display:"block",width:"100%",height:"auto",borderRadius:10}}/></figure><div className="setup-info"><small>ⓘ 사진 속 자리 찾기</small><p><strong>왼쪽 네모:</strong> 역할 카드 (보안관만 앞면)<br/><strong>가운데 네모:</strong> 캐릭터 카드 (모두 앞면)<br/><strong>오른쪽 권총 그림:</strong> 무기 자리. 처음엔 보드에 그려진 기본 권총을 써요.<br/><strong>위쪽 총알 윤곽:</strong> 생명력 토큰을 놓는 자리.</p></div></>}
 {step===6&&<><div className="setup-info"><small>ⓘ {count}명 준비 안내</small><strong>{roles[count]}</strong><p>이 역할 카드만 골라 섞고, 한 장씩 뒷면으로 나눠요. 남는 역할 카드는 상자에 넣습니다.</p></div><CardArtwork id="sheriff" title="보안관 역할"/><p>자기 역할만 몰래 확인하세요. 보안관은 앞면으로 뒤집고, 다른 사람은 뒷면으로 놓아요.</p><Tip>다른 사람에게 보여 주지 마세요.</Tip></>}
 {step===7&&<><p>캐릭터 16장을 섞어 한 장씩 나누고 모두 앞면으로 놓아요. 이름과 능력을 읽어 주세요. 남은 캐릭터·보드는 상자에 넣어요.</p><div className="setup-info"><small>ⓘ 생명력 놓기</small><strong>캐릭터의 총알 표시만큼 토큰을 받아요.</strong><p><LabelledText text={"예: 총알이 4개인 캐릭터 → 생명력 토큰 4개."}/></p></div><Tip>보안관은 생명력을 1 더 받아요. 캐릭터가 4라면 5개, 3이라면 4개예요. 이것이 보안관의 최대 생명력입니다.</Tip><p>남은 토큰은 중앙에 모아 두세요. 잃거나 회복한 생명력을 이곳에서 주고받아요.</p></>}
 {step===8&&<><div className="setup-info"><small>ⓘ 시작 손패 나누기</small><strong>게임 카드 80장을 섞고, 각자 시작 생명력만큼 뒷면으로 받아요.</strong><p>생명력 4 → 손패 4장. 생명력 5인 보안관 → 손패 5장.</p></div><ul className="setup-placement-list"><li><strong>중앙 카드:</strong> 남은 카드를 가운데에 뒷면으로 쌓아요.</li><li><strong>버림 더미:</strong> 중앙 카드 옆에 빈자리를 남겨 두세요.</li><li><strong>공용 총알 토큰:</strong> 남은 토큰은 중앙에 모아요.</li><li><strong>손패:</strong> 각자 손에 들고 자기만 봐요.</li></ul><p>카드를 가져올 때는 중앙 카드 맨 위에서 가져와요. 사용하거나 버린 카드는 버림 더미에 앞면으로 놓습니다.</p><Tip>보안관부터 시작하고 시계방향으로 진행해요.</Tip><p><LabelledText text={"첫 차례의 기본 순서: 중앙 카드에서 2장 가져오기 → 카드 사용 → 현재 생명력보다 많은 손패 버리기."}/></p><p>이제 준비는 끝났어요. 다음 안내에서 목표와 진행 규칙을 확인하세요.</p></>}
 </div>
 <button className="primary full" onClick={()=>{if(step<8)move(step+1);else{const p=progress();write('progress',{...p,done:[...new Set([...p.done,'setup'])]});go('/learn/roles')}}}>{step<8?'다음 준비 단계 →':'준비 완료 · 다음 안내 →'}</button>
 {step>0&&<div className="two-col"><button className="back-link" onClick={()=>move(step-1)}>‹ 이전 단계</button><button className="secondary" onClick={()=>{setCount(4);move(0)}}>준비 처음부터</button></div>}
 </>;
}










