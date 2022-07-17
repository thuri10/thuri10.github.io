import PageTitle from "./PageTitle"

export default function Hero() {
  return (
    <div className="flex w-full flex-col">
      <div className="space-y-2 pb-4 text-center md:space-y-5 md:text-left">
        <PageTitle>Hi, I'm Martin</PageTitle>
        <p className="max-w-none pb-4 text-lg leading-7 ">
          I'm a self taught developer looking to improve my coding and application security skills
          everyday. Here is a diary of my learning adventures notes and projects.
        </p>
      </div>
    </div>
  )
}
