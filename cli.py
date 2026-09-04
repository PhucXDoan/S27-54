################################################################################
#
# This is the command-line interface Python script.
#
# This is where all dev-tool scripts will be implemented.
#
# TODO Explain how to add subcommands.
#

import subprocess
import shlex
import pathlib
import argparse
import sys
import typing
import dataclasses





################################################################################
#
# Low-level implementation details.
#
# Feel free to skip this section.
#





# "Static global class" so functions do not have to state `global ...`.
# Also useful for annotating what variables are global and which aren't.
# Do not instantiate.

@dataclasses.dataclass(kw_only = True)
class Registered_CLI_Subcommand:
    function : typing.Callable[[], None]
    name     : str

class GLOBAL:

    registered_cli_subcommands : list[Registered_CLI_Subcommand] = []





# To be used for when referring to files relative to the root of the
# repository regardless of what the current working directory is.

def quote_path(repository_relative_file_path : str) -> str:

    path = pathlib.Path(__file__).parent.resolve().joinpath(repository_relative_file_path)

    return f'"{path.as_posix()}"'



# Note that execution of shell commands is non-trivial. There are always
# edge-cases where it does not work well because of OS or parsing reasons.
# Nonetheless, this routine should be good enough for majority of dev-tool usages.

def execute_shell_command(command : str) -> None:



    # Format the given command string into something that's
    # pretty for printing out what the executed shell command is.
    # This does not handle every edge-case of shell command strings perfectly,
    # but it should be good enough for non-pathological cases.

    UNDERLINE     = '\x1b[4m'
    FG_CYAN       = '\x1B[36m'
    ANSI_RESET    = '\x1B[0m'
    ANSI_RESET_FG = '\x1B[39m'

    command_parts     = command.strip().split()
    displayed_command = ' '.join([
        f'{FG_CYAN}${ANSI_RESET_FG}',                                 # The shell command indicator.
        f'{FG_CYAN}{command_parts[0]}{ANSI_RESET_FG}',                # Highlight the first token; this is typically the command being executed.
        *command_parts[1:]                                            # Other stuff is typically the command's arguments.
    ])
    displayed_command = f'{UNDERLINE}{displayed_command}{ANSI_RESET}' # Make it more obvious.



    # Execute the shell command and display the results.

    print(displayed_command)
    print()
    subprocess.run(shlex.split(command)) # TODO Handle exceptions better.
    print()



# Lots of type shenanigans here to make working with Python
# decorators slighly easier. Don't worry too much about it.
# It's absurd.

Decorator_Parameters = typing.ParamSpec('Decorator_Parameters')
Decorator_Return     = typing.TypeVar('Decorator_Return')
Function_Parameters  = typing.ParamSpec('Function_Parameters')
Function_Return      = typing.TypeVar('Function_Return')

def make_decorator(
    decorator : typing.Callable[
        typing.Concatenate[
            typing.Callable[Function_Parameters, Function_Return],
            Decorator_Parameters,
        ],
        Decorator_Return,
    ]
) -> typing.Callable[
    Decorator_Parameters,
    typing.Callable[
        [typing.Callable[Function_Parameters, Function_Return]],
        Decorator_Return,
    ]
]:

    def wrapper(
        *args    : Decorator_Parameters.args,
        **kwargs : Decorator_Parameters.kwargs,
    ) -> typing.Callable[
        [typing.Callable[Function_Parameters, Function_Return]],
        Decorator_Return,
    ]:

        def applied(
            function : typing.Callable[Function_Parameters, Function_Return]
        ) -> Decorator_Return:

            return decorator(function, *args, **kwargs)

        return applied

    return wrapper



# TODO.

@make_decorator
def register_cli_subcommand(
    function    : typing.Callable[[], None],
    description : str,
) -> None:

    GLOBAL.registered_cli_subcommands += [Registered_CLI_Subcommand(
        function = function,
        name     = function.__name__,
    )]





################################################################################





@register_cli_subcommand(
    description = 'Run static type-checker for all Python scripts.',
)
def python_typecheck() -> None: # TODO Flesh out.

    execute_shell_command(f'''
        python -m mypy
            {quote_path('.')}
            --strict
            --disallow-untyped-defs
    ''')





################################################################################





@register_cli_subcommand(
    description = 'Build GUI script into a standable executable for distribution.',
)
def build_gui() -> None: # TODO Flesh out.

    execute_shell_command(f'''
        python -m PyInstaller
            --onefile
            --specpath {quote_path('./build/')}
            --workpath {quote_path('./build/')}
            --distpath {quote_path('./build/')}
            --noconsole
            {quote_path('./gui.py')}
    ''')





################################################################################
#
# TODO Handle parsing and execution of the inputted command-line arguments.
#





inputted_subcommand_name = sys.argv[1]

matched_subcommands = [
    subcommand
    for subcommand in GLOBAL.registered_cli_subcommands
    if subcommand.name == inputted_subcommand_name
]

if not matched_subcommands:
    raise NotImplementedError('TODO Unknown subcommand.')

matched_subcommand, = matched_subcommands

matched_subcommand.function()
