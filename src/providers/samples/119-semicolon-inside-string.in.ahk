; [Issue #119](https://github.com/mark-wiemer/ahkpp/issues/119)
MsgBox, { ; comment with close brace }
bar()
{
if (foo() == ";")
true
}
foo()
{
return ";"
}
