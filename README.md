# Using Git.

I recommend using a Git GUI.
The one I use is SmartGit ([download link](https://download.smartgit.dev/smartgit/smartgit-26_1_056-win-installer.zip)).
I've written a tutorial a while back ([guide link](https://github.com/RockSat-X/RSXVT2026/wiki/Onboarding-the-Git-Workflow));
it's slightly out-dated but I suggest referencing it nonetheless.
I do not recommend using GitHub Desktop.

<p align="center"><kbd><img src="./misc/smartgit.png" width="600px"></kbd></p>&nbsp;

There is a GitHub branch rule applied to `main`.
No one can directly push changes to `main`.
All commits must be merged into `main` through a pull-request.
When making commits, do it on your own branch, not `main`.



# Documentation.

Documentation and their media is stored in `./documentation/`.
We use Typst for typesetting.

Open Windows Terminal
and download the `typst` command-line interface:
```
$ winget install typst
```

Restart your shell session
(i.e., close Windows Terminal and reopen)
and check that `typst` is available:
```
$ typst
Welcome to Typst, we are glad to have you here! ❤️
...
```

To convert the `*.typ` documents to PDF,
I recommend using the `typst watch` command;
this will continuously regenerate the PDF every time the `*.typ` document is modified.
```
$ typst watch .\documentation\requirements_specifications.typ
```

The location of the PDF will be in the same folder as the `*.typ` document.
Open the PDF in your browser,
and refresh the browser every time you want to see the newly recompiled document.
Press `CTRL-C` to end the watch command.



# SolidWorks.

Download the latest version of SolidWorks ([download page](https://4help.vt.edu/sp?id=kb_article_view&sysparm_article=KB0012191)).

<p align="center"><kbd><img src="./misc/solidworks.png" width="600px"></kbd></p>&nbsp;

**Important policy when working with SolidWorks and Git**:

- Make sure that your local repository is up to date with the repository on GitHub (i.e., do a pull).

- If you're going to be working on a part or assembly,
make sure that you've checked out the lastest version of that file.

- If you see that a file is modified but you didn't do anything,
make sure to discard those changes.

- If you see that the file is modified as expected,
make sure to commit your work and push your commits to your branch.

- Two people should not be simultaneously editing a SolidWorks file.
If this happens, file conflicts will occur, and while work will not be lost, it will have to be redone.
