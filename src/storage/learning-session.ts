import type {DistanceInput} from "../domain/distance";
export const learningSession = {
  setup:{step:0,count:4}, reviewSetup:{step:0,count:4},
  lessons:{} as Record<string,{seat:string;distance?:DistanceInput}>,
  reviewLessons:{} as Record<string,{seat:string;distance?:DistanceInput}>,
  review:false, protectBookmark:false, hasResume:false,
};
export function restartLesson(id:string) {
 learningSession.review=true;
 learningSession.protectBookmark=learningSession.hasResume;
 if(id==='setup'){learningSession.reviewSetup.step=0;learningSession.reviewSetup.count=4;}
 delete learningSession.reviewLessons[id];
}
export function continueLearning(){learningSession.review=false;learningSession.protectBookmark=false;}
