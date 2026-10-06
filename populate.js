const fs = require("fs");
const emoji = require("github-emoji");
const jsdom = require("jsdom").JSDOM,
  options = {
    resources: "usable"
  };
const { getConfig, outDir } = require("./utils");
const { getRepos, getUser } = require("./api");

function convertToEmoji(text) {
  if (text == null) return;
  text = text.toString();
  var pattern = /(?<=:\s*).*?(?=\s*:)/gs;
  if (text.match(pattern) != null) {
    var str = text.match(pattern);
    str = str.filter(function(arr) {
      return /\S/.test(arr);
    });
    for (i = 0; i < str.length; i++) {
      if (emoji.URLS[str[i]] != undefined) {
        text = text.replace(
          `:${str[i]}:`,
          `<img src="${emoji.URLS[str[i]]}" class="emoji">`
        );
      }
    }
    return text;
  } else {
    return text;
  }
}

function populateProfile(document, user, opts) {
  const { twitter, linkedin, medium, dribbble } = opts;
  document.title = user.login;

  var icon = document.createElement("link");
  icon.setAttribute("rel", "icon");
  icon.setAttribute("href", user.avatar_url);
  icon.setAttribute("type", "image/png");
  document.getElementsByTagName("head")[0].appendChild(icon);

  document.getElementById(
    "profile_img"
  ).style.background = `url('${user.avatar_url}') center center`;
  document.getElementById(
    "username"
  ).innerHTML = `<span style="display:${
    user.name == null || !user.name ? "none" : "block"
  }">${user.name}</span><a href="${user.html_url}">@${user.login}</a>`;
  document.getElementById("userbio").innerHTML = convertToEmoji(user.bio);
  document.getElementById("userbio").style.display =
    user.bio == null || !user.bio ? "none" : "block";
  document.getElementById("about").innerHTML = `
                <span style="display:${
                  user.company == null || !user.company ? "none" : "block"
                };"><i class="fas fa-users"></i> &nbsp; ${user.company}</span>
                <span style="display:${
                  user.email == null || !user.email ? "none" : "block"
                };"><i class="fas fa-envelope"></i> &nbsp; ${user.email}</span>
                <span style="display:${
                  user.blog == null || !user.blog ? "none" : "block"
                };"><i class="fas fa-link"></i> &nbsp; <a href="${user.blog}">${
    user.blog
  }</a></span>
                <span style="display:${
                  user.location == null || !user.location ? "none" : "block"
                };"><i class="fas fa-map-marker-alt"></i> &nbsp;&nbsp; ${
    user.location
  }</span>
                <span style="display:${
                  user.hireable == false || !user.hireable ? "none" : "block"
                };"><i class="fas fa-user-tie"></i> &nbsp;&nbsp; Available for hire</span>
                <div class="socials">
                <span style="display:${
                  twitter == null ? "none !important" : "block"
                };"><a href="https://www.twitter.com/${twitter}" target="_blank" class="socials"><i class="fab fa-twitter"></i></a></span>
                <span style="display:${
                  dribbble == null ? "none !important" : "block"
                };"><a href="https://www.dribbble.com/${dribbble}" target="_blank" class="socials"><i class="fab fa-dribbble"></i></a></span>
                <span style="display:${
                  linkedin == null ? "none !important" : "block"
                };"><a href="https://www.linkedin.com/in/${linkedin}/" target="_blank" class="socials"><i class="fab fa-linkedin-in"></i></a></span>
                <span style="display:${
                  medium == null ? "none !important" : "block"
                };"><a href="https://www.medium.com/@${medium}/" target="_blank" class="socials"><i class="fab fa-medium-m"></i></a></span>
                </div>
                `;
}

function projectImagePath(repoName) {
  const extensions = [".png", ".jpg", ".jpeg", ".gif"];
  const extension = extensions.find(ext =>
    fs.existsSync(`${outDir}/assets/project-images/${repoName}${ext}`)
  );

  if (extension) {
    return `
                            <div class="project-image">
                              <img src="./assets/project-images/${repoName}${extension}" alt="${repoName} project preview">
                            </div>`;
  }

  return "";
}

module.exports.updateHTML = (username, opts) => {
  const { includeFork, preserveConfig } = opts;
  const sourceHTML = fs.existsSync(`${outDir}/index.html`)
    ? `${outDir}/index.html`
    : `${__dirname}/assets/index.html`;
  const isInitialBuild = sourceHTML === `${__dirname}/assets/index.html`;

  jsdom
    .fromFile(sourceHTML, options)
    .then(function(dom) {
      let window = dom.window,
        document = window.document;
      (async () => {
        try {
          console.log("Building HTML/CSS...");
          const repos = await getRepos(username, opts);

          document.getElementById("work_section").innerHTML = "";
          document.getElementById("forks_section").innerHTML = "";
          document.getElementById("forks").style.display = includeFork
            ? "block"
            : "none";

          for (var i = 0; i < repos.length; i++) {
            let element;
            const isOwned =
              repos[i].owner &&
              repos[i].owner.login.toLowerCase() === username.toLowerCase();
            if (repos[i].fork == false && isOwned) {
              element = document.getElementById("work_section");
            } else if (repos[i].fork == true && includeFork == true) {
              element = document.getElementById("forks_section");
            } else {
              continue;
            }
            element.innerHTML += `
                        <a href="${repos[i].html_url}" target="_blank">
                        <section>
                            <div class="section_title">${repos[i].name}</div>
                            <div class="about_section">
                            <span style="display:${
                              repos[i].description == undefined
                                ? "none"
                                : "block"
                            }">${convertToEmoji(repos[i].description)}</span>
                            </div>${projectImagePath(repos[i].name)}
                            <div class="bottom_section">
                                <span style="display:${
                                  repos[i].language == null
                                    ? "none"
                                    : "inline-block"
                                };"><i class="fas fa-code"></i>&nbsp; ${
              repos[i].language
            }</span>
                                ${
                                  repos[i].isCollaboration === true
                                    ? '<span><i class="fas fa-users"></i></span>'
                                    : ""
                                }
                                <span><i class="fas fa-star"></i>&nbsp; ${
                                  repos[i].stargazers_count
                                }</span>
                                <span><i class="fas fa-code-branch"></i>&nbsp; ${
                                  repos[i].forks_count
                                }</span>
                            </div>
                        </section>
                        </a>`;
          }

          const user = await getUser(username);
          if (isInitialBuild) {
            populateProfile(document, user, opts);
          }

          if (!preserveConfig) {
            const data = await getConfig();
            data[0].username = user.login;
            data[0].name = user.name;
            data[0].userimg = user.avatar_url;

            await fs.writeFile(
              `${outDir}/config.json`,
              JSON.stringify(data, null, " "),
              function(err) {
                if (err) throw err;
                console.log("Config file updated.");
              }
            );
          }
          await fs.writeFile(
            `${outDir}/index.html`,
            "<!DOCTYPE html>" + window.document.documentElement.outerHTML,
            function(error) {
              if (error) throw error;
              console.log(`Build Complete, Files can be Found @ ${outDir}\n`);
            }
          );
        } catch (error) {
          console.log(error);
        }
      })();
    })
    .catch(function(error) {
      console.log(error);
    });
};
