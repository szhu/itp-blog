import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import {
  dirname,
  relative,
  join,
} from "https://deno.land/std@0.117.0/path/mod.ts";
import { expandGlob } from "https://deno.land/std@0.117.0/fs/expand_glob.ts";
import { globToRegExp } from "https://deno.land/std@0.117.0/path/glob.ts";
import importedAll from "https://jspm.dev/npm:it-all@1.0.6!cjs";

const all = importedAll as <T>(input: AsyncIterableIterator<T>) => Promise<T[]>;

function urlIsAbsolute(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

async function writeFilesGitIgnore(lines: string[]) {
  return await Deno.writeTextFile(
    "files/.gitignore",
    lines.map((line) => line + "\n").join("")
  );
}

async function getGitFiles() {
  const git = Deno.run({
    cmd: [
      "bash",
      "-c",
      // https://stackoverflow.com/a/39064584/782045
      // https://stackoverflow.com/q/51848552#comment90650574_51848552
      `( git status --untracked-files=all --short | grep '^?' | cut -d' ' -f2- && git ls-files ) | sort -u`,
    ],
    stdout: "piped",
    cwd: cwd,
  });
  if (!(await git.status()).success) {
    throw new Error("git status failed");
  }
  let output = new TextDecoder().decode(await git.output());
  return new Set(output.replace(/\n$/, "").split("\n"));
}

async function glob(pattern: string) {
  return (await all(expandGlob(pattern, { caseInsensitive: true }))).map(
    (item) => relative(cwd, item.path)
  );
}

let cwd = Deno.cwd();

{
  console.log("Finding html files.");
  let htmlFiles = await glob("posts/*.html");
  console.log("Found", htmlFiles.length, "files.\n");

  console.log("Finding files referenced from html files.");
  let referencedFiles: Record<string, string> = {};
  for (let htmlPath of htmlFiles) {
    let doc = new DOMParser().parseFromString(
      await Deno.readTextFile(htmlPath),
      "text/html"
    );
    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    for (let node of doc.querySelectorAll("[href], [src]")) {
      if (!(node instanceof Element)) continue;

      let el = node as Element;

      let attr = (el.getAttribute("href") || el.getAttribute("src"))!;
      if (urlIsAbsolute(attr)) continue;

      let referencedFile = join(dirname(htmlPath), attr);
      referencedFiles[referencedFile] = htmlPath;
    }
  }
  console.log("Found", Object.keys(referencedFiles).length, "files.\n");

  await writeFilesGitIgnore([]);

  console.log("Getting files from git.");
  let gitFiles = await getGitFiles();
  console.log("Found", gitFiles.size, "files.\n");

  console.log("Filtering files from git:");
  let mediaPattern = globToRegExp(
    "files/**/process/*.{png,jpg,jpeg,heic,mov,mp4}",
    {
      caseInsensitive: true,
    }
  );
  let gitIgnoreLines = [];
  for (let file of gitFiles) {
    let referenced = referencedFiles[file];
    let isMedia = mediaPattern.test(file);

    if (isMedia && !referenced) {
      console.log(file);

      let gitIgnorePattern = file.replace(/^files\//, "/");
      gitIgnoreLines.push(gitIgnorePattern);
    }
  }
  console.log("Found", gitIgnoreLines.length, "files.\n");

  console.log("Writing to gitignore.");
  await writeFilesGitIgnore(gitIgnoreLines);
  console.log("Done.");
}
