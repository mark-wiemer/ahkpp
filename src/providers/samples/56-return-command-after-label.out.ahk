; [Issue #56](https://github.com/mark-wiemer/ahkpp/issues/56)
func1(x, y) {
    return x + y
}

Subroutine:
    SoundBeep
return

func2(x, y) {
    return x - y
}

^SPACE::
    SoundBeep
return

func3(x, y) {
    return x * y
}
