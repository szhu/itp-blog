import prettier from "https://jspm.dev/npm:prettier@2.1.2";
import prettierParserHtml from "https://jspm.dev/npm:prettier@2.1.2/parser-html";

export default function prettify(html: string): string {
  return (prettier as any).format(html, {
    parser: "html",
    tabWidth: 1,
    plugins: [prettierParserHtml],
  });
}
