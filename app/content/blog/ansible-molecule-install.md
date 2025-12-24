--- 
title: "Ansible Role のテストに Molecule をインストールしてみた 🧪"
description: "Molecule を利用すると、Ansible Role の Lint, Test などが実行できます。CI に Molecure を組み込むことで、さまざまなプラットフォームで再現性の高い Role を開発できます。"
pubDate: "2022-09-11"
tags: ["molecure", "ansible"]
---

Ansible roleのテストにMoleculeを導入してみました！

https://molecule.readthedocs.io/en/latest/

Moleculeとは、ansible roleの開発やテストを支援するツールです 🛠️

これまでLinterとして `ansible-lint`、テストとして `Serverspec` などを使用していたものを、Moleculeだけで管理することができるようになります。

すでに作成済みのroleにも簡単に導入できるため、先日以下のroleにMoleculeを導入しました。GitHub ActionsでMoleculeが動作するようになっています：

https://github.com/yumenomatayume/ansible-role-macos-dev-setup

（こちらはMac開発環境をセットアップするために作成したroleです）

こちらを参考にMoleculeの導入方法をご紹介します 😊


## 使用したバージョン

- Mac: 10.15.7
- Python: 3.9.1
- ansible: 2.11.3
- molecule: 3.4.0

## Molecule のインストール

https://molecule.readthedocs.io/en/latest/installation.html

インストールに必要な前提条件は以下の通りです。

- Python >= 3.6
- Ansible >= 2.8

私は仮想環境 (venv) を使用しているので、以下のように仮想環境を有効化した状態で進めていきます。

```bash
python3 -m venv .venv
. .venv/bin/activate

pip install -U pip
```

ansible 同様、molecule も Python で書かれているため、pip より install ができます。
以下のコマンドを実行してmoleculeをインストールします。

```bash
pip install "molecule[ansible,docker,lint]"
```

この時、`molecule[ansible,docker,lint]` と引数を指定することで、必要な関連パッケージもインストールできます。
今回使用した 3 つの引数は以下になります。

- ansible
  - molecure と同時に ansible をインストールします。
  - すでに ansible がインストールされている場合は不要なオプションです。
- docker
  - テスト環境に docker を使用するためインストールしています。
- lint
  - テスト実行前に yml の lint を実行するためインストールしています。

インストールされたパッケージは以下のようになりました。 `ansible-lint` や `yamllint` 、 `docker` など、上記で指定したパッケージも入っていることが確認できます。

```bash
$ molecule --version
molecule 3.4.0 using python 3.9
    ansible:2.11.3
    delegated:3.4.0 from molecule
    docker:0.2.4 from molecule_docker
```

▶ pip freeze の実行結果はこちらです。

```bash
$ pip freeze
ansible==4.4.0
ansible-core==2.11.3
ansible-lint==5.1.2
arrow==1.1.1
backports.entry-points-selectable==1.1.0
bcrypt==3.2.0
binaryornot==0.4.4
bracex==2.1.1
Cerberus==1.3.2
certifi==2021.5.30
cffi==1.14.6
cfgv==3.3.0
chardet==4.0.0
charset-normalizer==2.0.4
click==8.0.1
click-help-colors==0.9.1
colorama==0.4.4
commonmark==0.9.1
cookiecutter==1.7.3
cryptography==3.4.7
distlib==0.3.2
docker==5.0.0
enrich==1.2.6
filelock==3.0.12
flake8==3.9.2
identify==2.2.13
idna==3.2
Jinja2==3.0.1
jinja2-time==0.2.0
MarkupSafe==2.0.1
mccabe==0.6.1
molecule==3.4.0
molecule-docker==0.2.4
nodeenv==1.6.0
packaging==21.0
paramiko==2.7.2
pathspec==0.9.0
platformdirs==2.2.0
pluggy==0.13.1
poyo==0.5.0
pre-commit==2.14.0
pycodestyle==2.7.0
pycparser==2.20
pyflakes==2.3.1
Pygments==2.9.0
PyNaCl==1.4.0
pyparsing==2.4.7
python-dateutil==2.8.2
python-slugify==5.0.2
PyYAML==5.4.1
requests==2.26.0
resolvelib==0.5.4
rich==10.7.0
ruamel.yaml==0.17.10
ruamel.yaml.clib==0.2.6
six==1.16.0
subprocess-tee==0.3.2
tenacity==8.0.1
text-unidecode==1.3
toml==0.10.2
urllib3==1.26.6
virtualenv==20.7.2
wcmatch==8.2
websocket-client==1.2.1
yamllint==1.26.2
```

## role の作成

これまでは、新たに ansible role を作成するときは、`ansible-galaxy` コマンドを実行していましたが、molecule を含む role を作成する場合は以下のコマンドを実行します。

```bash
molecule init role roles/my-role
```

すると、以下のように molecule を含む role が作成されます。現在のバージョンだと、デフォルトで 5 つの yml が作成されていました。
▶ 作成された role のディレクトリ構成です。

```bash
$ tree roles/my-role/
roles/my-role/
├── README.md
├── defaults
│   └── main.yml
├── files
├── handlers
│   └── main.yml
├── meta
│   └── main.yml
├── molecule
│   └── default
│       ├── INSTALL.rst
│       ├── converge.yml
│       ├── create.yml
│       ├── destroy.yml
│       ├── molecule.yml
│       └── verify.yml
├── tasks
│   └── main.yml
├── templates
├── tests
│   ├── inventory
│   └── test.yml
└── vars
    └── main.yml

10 directories, 14 files
```

また、既に作成してある role に Molecule を入れたいときは、そのディレクトリに移動して `molecule init scenario -r <role名>` を実行します。

```bash
cd roles/my-role
molecule init scenario -r my-role
```

すると、`molecule/default`ディレクトリとデフォルトの yml ファイルが作成されます。（こちらは1 つの yml が生成されました。）

```bash
$ tree molecule/
molecule/
└── default
    └── molecure.yml

1 directory, 1 files
```

以上で Molecule に必要なファイルの準備はできました。
次回は Molecule ファイルの設定方法と CLI についてご紹介します。

## Reference（参考文献）

- [Molecule - Test your Ansible roles](https://molecule.readthedocs.io/en/latest/)
- [Molecule Installation Guide](https://molecule.readthedocs.io/en/latest/installation.html)
- [Ansible RoleのテストにMoleculeを導入した話 - Qiita](https://qiita.com/yuuki-m/items/60f78d38b0f80b1e4b9e)
