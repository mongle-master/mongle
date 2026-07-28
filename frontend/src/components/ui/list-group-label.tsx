// 디자인 언어의 eyebrow(대문자 캡션 라벨) 클래스를 그대로 쓴다.
export function ListGroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-2 px-3">{children}</p>
}
