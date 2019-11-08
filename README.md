# Codevember 2019

My contribution for codevember 2019.

- - -

## 📝 Table of contents
- [**Prerequisites**](#prerequisites)
- [**Commands**](#commands)
- [**Project structure**](#project-structure)
- [**Author**](#author)
- [**License**](#license)

- - -

<a name="prerequisites"></a>
## ⚙️ Prerequisites
- [**asdf**](https://github.com/asdf-vm/asdf)
- [**Make**](https://www.gnu.org/software/make/)
- [**Node.js**](https://nodejs.org)
- [**Yarn**](https://yarnpkg.com)

<a name="commands"></a>
## ⌨️ Commands
### Serve
```makefile
## Serve latest src/*.js at http://localhost:9966 with hot reloading

make
```

💡 This command will also **install dependencies** on first run and when `package.json` or `yarn.lock` files are updated.

### Build
```makefile
## Build site for production use

make build
```

💡 This command will also **install dependencies** on first run and when `package.json` or `yarn.lock` files are updated.

### Deploy
```makefile
## Deploy site to https://codevember.davidauthier.wearemd.com/2019/11/

make deploy
```

#### Configuration
Before running this command you need to create an `.env` file at the root of the repo:

```bash
USER:=user
SERVER:=server
SERVER_DEST:=server_dest
```

### Help
```makefile
## List available commands

make help
```

<a name="project-structure"></a>
## 🗄️ Project structure
```
.
├── src            # JavaScript source files
│
├── .gitignore     # Files and folders ignored by Git
├── .tool-versions # Which version to use locally for each language, used by asdf
├── LICENSE        # License
├── Makefile       # Commands for this project
├── package.json   # JavaScript dependencies, used by Yarn
├── README.md      # Project documentation
└── yarn.lock      # Tracking exact versions for JavaScript dependencies, used by Yarn
```

<a name="author"></a>
## ✍️ Author
[**@Awea**](https://github.com/Awea)

<a name="license"></a>
## 📄 License
**Codevember 2019** is licensed under the [GNU General Public License v3.0](LICENSE).
