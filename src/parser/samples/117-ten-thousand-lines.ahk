; [Issue #117](https://github.com/mark-wiemer/ahkpp/issues/117)
; Go to definition here should work, even though `bottom` is defined
; after line 10,000
bottom()

top(x:=0, y:=0) {

}
top() ; this works just fine
; blank lines until line 10,001 here...








































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































; Likewise, go to definition here should go back to the top.
top()

; Function defined after line 10,000
bottom(x:=0, y:=0) {

}
