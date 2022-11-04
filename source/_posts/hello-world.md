---
title: Hello World
---

Welcome to [Hexo](https://hexo.io/)! This is your very first post. Check [documentation](https://hexo.io/docs/) for more info. If you get any problems when using Hexo, you can find the answer in [troubleshooting](https://hexo.io/docs/troubleshooting.html) or you can ask me on [GitHub](https://github.com/hexojs/hexo/issues).

## Quick Start

### Create a new post

```py
from __future__ import annotations

import os.path

pytest_plugins = ["mypy.test.data"]


def pytest_configure(config):
    mypy_source_root = os.path.dirname(os.path.abspath(__file__))
    if os.getcwd() != mypy_source_root:
        os.chdir(mypy_source_root)


# This function name is special to pytest.  See
# http://doc.pytest.org/en/latest/writing_plugins.html#initialization-command-line-and-configuration-hooks
def pytest_addoption(parser) -> None:
    parser.addoption(
        "--bench", action="store_true", default=False, help="Enable the benchmark test runs"
    )
```

More info: [Writing](https://hexo.io/docs/writing.html)

### Run server

```bash
$ hexo server
```

More info: [Server](https://hexo.io/docs/server.html)

### Generate static files

```bash
$ hexo generate
```

More info: [Generating](https://hexo.io/docs/generating.html)

### Deploy to remote sites

```bash
$ hexo deploy
```

More info: [Deployment](https://hexo.io/docs/one-command-deployment.html)
