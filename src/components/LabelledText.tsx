export function LabelledText({text}:{text:string}) {
  const match=text.match(/^([^:：\n]{1,40})([:：])([\s\S]*)$/);
  if(!match || /^https?:/i.test(text)) return <>{text}</>;
  return <><strong>{match[1]}</strong>{match[2]}{match[3]}</>;
}
