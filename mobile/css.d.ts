// CSS importlari uchun TypeScript deklaratsiyalari (Metro ularni runtime'da hal qiladi).
declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
