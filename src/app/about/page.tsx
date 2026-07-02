import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Music, Users, Award, Heart, ChevronRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-start overflow-hidden bg-black text-white py-36 md:py-48">
        {/* Background image (grayscale, desaturated, dark overlay) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/imagesfooter/4.png"
            alt="Clase de piano Détaché"
            className="w-full h-full object-cover filter grayscale contrast-125 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="max-w-5xl text-left space-y-6">
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-white leading-[1.1] font-sans">
              <span className="text-[#DFB012]">Aprender</span> música debe <br className="hidden md:block" />
              ser una experiencia <br className="hidden md:block" />
              <span className="text-[#DFB012]">clara y motivadora.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Nuestra Historia Section */}
      <section className="py-20 md:py-32 bg-[#F8F7F4] text-slate-800 relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Polaroid Graphic (Left Side) */}
            <div className="relative flex justify-center py-10 order-2 md:order-1">
              <div className="relative w-full max-w-[450px]">
                {/* Hand-drawn yellow star/sparkle at the top-left */}
                <svg className="absolute -top-10 -left-10 w-24 h-24 text-[#DFB012] fill-current select-none z-10" viewBox="0 0 100 100">
                  <path d="M50 0 L54 35 L85 15 L62 42 L100 50 L62 58 L85 85 L54 65 L50 100 L46 65 L15 85 L38 58 L0 50 L38 42 L15 15 L46 35 Z" />
                </svg>

                <div className="relative bg-white p-5 pb-16 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 rounded-lg w-full -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-slate-50 relative">
                    <img
                      src="/imagesfooter/2.png"
                      alt="Academia Détaché Recepción"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-5 left-8 text-slate-400 font-sans italic text-sm">
                    Academia Détaché
                  </div>
                </div>
              </div>
            </div>

            {/* Texts (Right Side - Centered) */}
            <div className="flex flex-col items-center justify-center text-center space-y-6 md:px-8 order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary font-sans">
                Nuestra Historia
              </h2>
              <p className="text-lg md:text-xl text-slate-800 font-semibold leading-relaxed max-w-xl">
                Academia Detaché nació para transformar la frustración de aprender música en un camino claro y disfrutable.
              </p>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">
                Cansados de la improvisación, creamos en el sector sur de Santiago un método estructurado, cercano y apasionado que garantiza un avance real, poniendo siempre el progreso y el bienestar del alumno en el centro de nuestra historia.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom wave transition */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 translate-y-[1px]">
          <svg className="relative block w-full h-[40px] md:h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,8.75,55.05,18,83,26.26,143.08,44,224.22,54,321.39,56.44Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* Lo que nos Mueve Section */}
      <section className="py-20 bg-white text-slate-800 relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto text-center max-w-6xl space-y-16 relative z-10">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary">
              Lo que nos Mueve
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
              Nuestra forma de enseñar nace del amor por la música y del compromiso con cada estudiante.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1 */}
            <div className="bg-[#70125F] rounded-[2rem] p-8 aspect-[4/5] flex flex-col justify-between text-[#F8F7F4] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-left leading-tight">
                La música y las <br /> personas primero
              </h3>
              <div className="flex justify-end mt-4">
                <svg className="w-24 h-24 text-[#F8F7F4]/90 fill-current" viewBox="0 0 291 355">
                  <path d="M264.193 0.296023C278.841 -1.79452 289.933 7.36601 290.452 22.132C291.004 37.8673 290.738 53.5955 290.728 69.3429L290.652 157.328L290.629 216.74C290.722 231.839 292.013 250.647 289.151 265.195C282.556 298.715 247.658 317.927 215.274 309.71C200.019 305.783 186.978 295.898 179.075 282.27C172.2 270.522 170.363 256.495 173.98 243.373C184.207 206.858 220.253 199.152 253.002 208.114L254.201 134.547C223.901 142.783 192.853 149.58 162.298 157.255C148.329 160.764 131.289 163.661 117.747 168.732C114.358 170.001 112.566 174.781 111.421 178.063C111.052 213.348 110.873 256.415 111.446 291.272C112.766 371.643 -2.28884 375.007 0.0347272 302.033C0.569172 285.282 7.75183 269.433 19.9957 257.988C36.0341 243.006 52.1294 241.088 72.7213 241.873C74.084 201.933 73.542 155.025 73.066 115.107C72.1521 38.434 65.7005 49.6311 138.584 31.1144C180.376 20.5288 222.247 10.2565 264.193 0.296023ZM255.048 56.546C254.442 56.548 252.695 56.4981 252.07 56.6329L167.036 78.1798C152.383 81.8086 137.379 84.9834 122.997 89.4376C108.427 93.9506 106.783 119.461 117.878 128.288C128.055 130.206 161.075 120.492 173.084 117.502C200.568 110.753 228.011 103.832 255.411 96.7423C255.453 90.7226 257.01 59.6322 255.048 56.546Z" />
                </svg>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#70125F] rounded-[2rem] p-8 aspect-[4/5] flex flex-col justify-between text-[#F8F7F4] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-left leading-tight">
                Enseñanza cercana <br /> y apasionada
              </h3>
              <div className="flex justify-end mt-4">
                <svg className="w-24 h-24 text-[#F8F7F4]/90 fill-current" viewBox="0 0 204 292">
                  <path d="M41.55 0.71582C64.7814 -0.774098 99.4613 0.526344 123.807 0.508789L165.186 0.444336C173.443 0.400066 181.992 -0.128097 190.203 0.619141C193.371 0.90766 196.164 1.74899 198.705 3.75488C201.804 6.19889 202.728 9.36724 203.018 13.1348C204.04 26.5037 193.164 63.8068 189.867 78.7197C186.426 94.2485 183.984 111.047 179.13 126.141C178.252 128.872 176.947 131.791 174.955 133.899C169.407 139.777 132.186 137.267 123.486 137.238C122.936 160.542 122.883 202.124 124.135 225.593C124.709 236.189 166.285 254.937 168.872 269.043C172.367 288.107 153.319 296.643 139.223 287.52C131.561 281.339 118.342 267.572 110.146 263.955C98.4538 258.795 78.4274 286.499 66.5217 290.831C62.6754 292.232 58.6079 292.276 54.8684 290.449C50.6098 288.369 46.5039 284.342 45.0081 279.809C37.1549 256.012 78.9917 245.323 87.3411 228.148C90.3785 221.899 90.0435 149.896 87.5784 143.731C86.571 141.213 85.0064 139.45 82.4651 138.419C69.4833 133.15 17.5483 141.304 5.84106 135.551C3.47524 134.386 1.43732 132.52 0.635986 129.944C-0.417094 126.571 0.0487642 122.235 0.529541 118.795C2.66643 103.617 21.3639 20.2768 27.7825 9.62695C31.0336 4.22382 35.6737 2.25534 41.55 0.71582ZM94.1565 46.4766C83.5481 49.5603 56.7373 64.4092 47.1594 71.6992C42.9012 74.9335 43.5272 84.9682 48.5793 87.8877C58.2184 93.4564 81.1062 72.9259 88.0969 74.4219C93.6451 80.2626 84.8539 96.8585 102.926 97.7852C111.963 94.9568 146.045 80.425 151.158 71.3818C156.798 61.4005 143.008 52.9475 133.918 59.4102C125.241 63.7699 114.801 70.2852 106.559 72.9873C105.574 61.8717 108.756 47.8283 94.1565 46.4766Z" />
                </svg>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#70125F] rounded-[2rem] p-8 aspect-[4/5] flex flex-col justify-between text-[#F8F7F4] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-left leading-tight">
                Aprender <br /> con dirección
              </h3>
              <div className="flex justify-end mt-4">
                <svg className="w-24 h-24 text-[#F8F7F4]/90 fill-current" viewBox="0 0 255 229">
                  <path d="M150.535 0.0297852C186.383 -1.85155 186.068 86.1446 184.993 109.341C184.336 123.501 182.122 140.278 177.098 153.62C166.458 181.868 145.46 169.877 125.08 161.207C115.398 157.093 103.981 152.291 93.6791 147.925C93.5661 163.221 93.5987 178.518 93.7758 193.806C103.371 194.028 121.31 190.746 128.623 198.134C131.849 201.393 132.655 205.927 132.69 210.324C132.727 215.087 132.229 221.193 128.586 224.673C122.208 230.772 83.6839 228.146 73.9164 228.116C54.53 227.963 32.9234 229.054 13.5912 227.696C2.74635 225.482 -0.569159 217.407 1.45251 207.652C4.52049 192.837 13.7115 194.241 26.7328 194.371C26.6084 182.227 26.6152 170.091 26.7533 157.948C22.0506 155.398 17.7286 152.589 13.889 148.833C4.99373 140.254 -0.0206588 128.416 0.00134277 116.059C-0.0955815 102.995 5.11384 90.4498 14.4369 81.2974C27.8735 67.9897 41.6131 67.0043 59.1381 67.1997C76.7332 53.1363 94.4104 39.1747 112.167 25.3159C121.858 17.7349 139.329 2.05015 150.535 0.0297852ZM209.383 121.333C220.027 120.821 224.287 127.5 232.319 133.08C243.416 140.789 254.356 155.68 236.217 163.954C224.737 164.541 216.381 154.879 207.919 147.971C197.593 139.537 195.282 127.943 209.383 121.333ZM154.215 46.4546C151.119 39.718 146.615 35.9271 139.157 36.4888C116.811 49.7255 120.398 114.608 133.871 134.636C137.107 139.445 140.293 141.246 146.049 141.803C168.283 130.98 163.081 65.7426 154.215 46.4546ZM56.6566 108.033C53.201 102.908 46.9328 100.46 40.9183 101.886C35.7212 103.118 31.5847 107.047 30.0873 112.179C28.5899 117.301 29.9626 122.843 33.6801 126.674C37.3982 130.513 42.8897 132.055 48.0609 130.719C51.4563 129.841 54.4318 127.789 56.4603 124.934C60.0351 119.889 60.1131 113.157 56.6566 108.033ZM207.248 70.2603C216.794 70.0862 236.333 68.6147 244.65 71.1831C257.502 75.1539 257.993 91.5815 243.507 97.0679C237.999 97.4892 232.116 97.1513 226.273 97.4604C212.333 98.197 187.967 98.3878 197.595 76.6401C199.232 72.9422 203.49 71.4097 207.248 70.2603ZM224.641 3.08643C235.325 1.46691 244.267 7.96168 241.438 18.6108C239.376 26.368 220.796 42.7437 213.916 46.3579C199.336 47.4272 191.259 36.4749 200.851 24.3335C205.133 18.9141 218.691 6.52722 224.641 3.08643Z" />
                </svg>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#70125F] rounded-[2rem] p-8 aspect-[4/5] flex flex-col justify-between text-[#F8F7F4] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-left leading-tight">
                Disfrutar <br /> el proceso
              </h3>
              <div className="flex justify-end mt-4">
                <svg className="w-24 h-24 text-[#F8F7F4]/90 fill-current" viewBox="0 0 260 218">
                  <path d="M109.995 0C111.452 0.096246 114.041 0.578972 115.449 1.05562C119.396 2.3916 122.612 5.30725 124.328 9.10591C125.554 11.7817 125.369 15.5995 125.454 18.5487C125.957 35.9799 126.86 202.967 124.273 208.525C122.012 213.383 117.479 215.606 112.697 217.188C91.8734 216.056 95.8406 198.177 95.8315 182.505L95.8498 139.156L95.8246 59.771C95.8208 45.38 95.7269 31.0225 96.0255 16.6338C96.25 5.76789 99.7835 2.30303 109.995 0Z" />
                  <path d="M146.346 43.4496C157.561 42.7507 164.459 46.8893 164.597 58.9254C164.862 88.8441 164.795 118.796 164.811 148.721C164.817 160.968 166.931 168.201 154.547 174.577C144.229 175.405 136.494 171.611 136.431 160.117C136.238 124.512 135.351 88.5279 136.836 53.0108C137.011 48.802 143.128 45.1102 146.346 43.4496Z" />
                  <path d="M68.4924 47.3097C80.7867 46.5955 86.3111 51.5109 86.5112 63.7647C87.0091 94.2503 86.6815 124.768 86.6724 155.26C86.6701 165.692 85.9652 169.63 76.2017 174.319C73.7953 174.743 72.0549 174.837 69.6165 174.378C65.9142 173.705 62.6534 171.534 60.6059 168.376C55.4443 160.393 59.7086 81.0195 58.2844 65.9242C57.4298 56.8641 60.1523 51.4575 68.4924 47.3097Z" />
                  <path d="M185.541 62.4713C190.764 62.2757 200.242 64.8423 200.85 71.1036C203.176 95.01 201.844 119.913 201.634 143.976C201.571 151.211 195.503 154.673 189.475 156.428C187.51 156.393 185.327 156.149 183.461 155.492C180.07 154.3 176.839 151.906 175.405 148.523C172.938 142.7 172.993 76.0137 175.302 70.6713C177.339 65.9583 181.047 64.2014 185.541 62.4713Z" />
                  <path d="M33.3667 76.2743C58.3113 74.2875 47.2938 105.467 50.0957 119.392C54.0454 139.022 36.9055 157.144 24.4508 136.851C23.788 133.276 24.027 125.964 24.0361 122.063C15.6724 122.191 -8.60471 124.426 3.15813 103.475C5.4942 99.3145 18.734 100.405 23.9888 100.456C23.8529 89.0941 22.0231 82.295 33.3667 76.2743Z" />
                  <path d="M220.456 85.4199C231.694 85.1701 235.515 89.7128 236.397 100.512C244.966 100.319 259.772 98.0044 259.857 111.449C259.939 124.174 245.421 122.01 236.59 122.01C234.179 132.39 225.588 140.864 215.017 132.372C208.748 127.334 211.077 103.011 211.24 94.1027 214.289 88.9413 215.248 88.0682 220.456 85.4199Z" />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* Wavy Keyboard at the bottom */}
        <div className="w-full h-20 md:h-32 overflow-hidden relative mt-16 md:mt-24 select-none pointer-events-none">
          <img
            src="/recursos/Teclado Curvas.png"
            alt="Teclado Curvas"
            className="w-full h-full object-cover object-center block"
          />
        </div>
      </section>

      {/* Nuestro Equipo Section */}
      <section className="py-20 bg-white text-slate-800 relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto text-center max-w-6xl space-y-12 relative z-10">

          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary">
              Nuestro Equipo
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
              Detrás de cada clase hay personas que disfrutan enseñar y compartir su pasión por la música.
            </p>
          </div>

          {/* Cards Container with Yellow Ornaments and Arrow */}
          <div className="relative flex items-center justify-center max-w-5xl mx-auto py-8">

            {/* Left Star Ornament */}
            <svg className="absolute -left-12 top-0 w-16 h-16 text-[#DFB012] fill-current select-none z-10 hidden md:block" viewBox="0 0 100 100">
              <path d="M50 0 L54 35 L85 15 L62 42 L100 50 L62 58 L85 85 L54 65 L50 100 L46 65 L15 85 L38 58 L0 50 L38 42 L15 15 L46 35 Z" />
            </svg>

            {/* Right Star Ornament */}
            <svg className="absolute -right-12 bottom-0 w-16 h-16 text-[#DFB012] fill-current select-none z-10 hidden md:block" viewBox="0 0 100 100">
              <path d="M50 0 L54 35 L85 15 L62 42 L100 50 L62 58 L85 85 L54 65 L50 100 L46 65 L15 85 L38 58 L0 50 L38 42 L15 15 L46 35 Z" />
            </svg>

            {/* Next Arrow Button */}
            <button className="absolute -right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#DFB012] hover:bg-[#c99e10] text-slate-900 transition-all flex items-center justify-center shadow-md z-20 cursor-pointer">
              <ChevronRight className="h-6 w-6 stroke-[3px]" />
            </button>

            {/* Teachers Images Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">

              {/* Teacher 1 */}
              <div className="aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 relative group">
                <img
                  src="/nosotros/1.png"
                  alt="Profesor 1"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Teacher 2 */}
              <div className="aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 relative group">
                <img
                  src="/nosotros/2.png"
                  alt="Profesor 2"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Teacher 3 */}
              <div className="aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 relative group">
                <img
                  src="/nosotros/3.png"
                  alt="Profesor 3"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Final Section (Conoce una nueva forma de aprender) */}
      <section className="bg-white text-slate-800 relative pt-12 pb-0 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left side text and action button */}
            <div className="space-y-10 text-left">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-sans uppercase">
                <span className="text-[#DFB012]">Conoce una</span> <br />
                <span className="text-[#70125F]">nueva forma</span> <br />
                <span className="text-[#DFB012]">de aprender</span>
              </h2>
              <div>
                <Button asChild className="bg-[#70125F] hover:bg-[#590e4b] text-white font-bold uppercase tracking-wider text-[11px] px-8 h-12 rounded-full border-none shadow-md transition-transform hover:scale-105">
                  <Link href="/contact">Contáctanos</Link>
                </Button>
              </div>
            </div>

            {/* Right side image (photo 4.png) */}
            <div className="relative flex justify-center">
              <img
                src="/nosotros/4.png"
                alt="Conoce una nueva forma de aprender"
                className="w-full h-auto object-contain max-w-[480px] md:max-w-[550px] block translate-y-[2px]"
              />
            </div>

          </div>
        </div>

        {/* Bottom solid purple bar */}
        <div className="w-full h-4 bg-[#70125F] mt-0" />
      </section>
    </div>
  );
}
