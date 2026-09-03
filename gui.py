import pathlib
import imgui_bundle

################################################################################





class GUI:
    counter   = 0
    user_text = 'Type something here...'
    checked   = True





def gui() -> None:

    imgui_bundle.imgui.text('Welcome to Dear ImGui Bundle!')
    imgui_bundle.imgui.separator()

    if imgui_bundle.imgui.button('Click Me!'):
        GUI.counter += 1

    imgui_bundle.imgui.same_line()

    imgui_bundle.imgui.text(f'Button clicks: {GUI.counter}')

    changed, GUI.user_text = imgui_bundle.imgui.input_text('User Input', GUI.user_text)

    _, GUI.checked = imgui_bundle.imgui.checkbox('Show details', GUI.checked)



    if GUI.checked:

        imgui_bundle.imgui.text_colored(
            imgui_bundle.imgui.ImVec4(0.3, 0.8, 0.3, 1.0),
            f'You typed: {GUI.user_text}'
        )





################################################################################





runner_params = imgui_bundle.immapp.RunnerParams()
runner_params.callbacks.show_gui                              = gui
runner_params.app_window_params.window_title                  = 'GUI'
runner_params.app_window_params.restore_previous_geometry     = False
runner_params.app_window_params.window_geometry.size          = (1400, 950)
runner_params.app_window_params.window_geometry.position_mode = imgui_bundle.hello_imgui.WindowPositionMode.monitor_center
imgui_bundle.immapp.run(runner_params = runner_params)



# `imgui_bundle` produces an `.ini` file for saving GUI state across sessions.
# This is an unnecessary feature, and unfortunately is still not patched.
# We will just manually delete the file ourselves to keep the user's workspace unmodified.
# See: https://github.com/pthom/imgui_bundle/discussions/421

pathlib.Path(f'{runner_params.app_window_params.window_title}.ini').unlink(missing_ok = True)
