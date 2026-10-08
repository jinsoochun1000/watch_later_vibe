param([string]$BaseUrl = 'http://127.0.0.1:8080', [string]$Username = 'stk1', [string]$Password = 'stk1')
$ErrorActionPreference = 'Stop'
Import-Module Microsoft.PowerShell.Utility
$headers = @{ 'X-Requested-With' = 'XMLHttpRequest' }
$session = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
$post = $null
function Send-Json($Method, $Path, $Payload, $RequestHeaders) {
    $request = @{ Uri = "$BaseUrl/api$Path"; Method = $Method; Headers = $RequestHeaders; WebSession = $session; ContentType = 'application/json; charset=utf-8' }
    if ($null -ne $Payload) { $request.Body = [Text.Encoding]::UTF8.GetBytes(($Payload | ConvertTo-Json -Compress)) }
    Invoke-RestMethod @request
}
try {
    $login = Send-Json POST '/auth/login' @{ username = $Username; password = $Password } $headers
    $authorized = @{ 'X-Requested-With' = 'XMLHttpRequest'; Authorization = "Bearer $($login.accessToken)" }
    $inputPost = @{ title = '[자동 검증] 한글 영상'; videoUrl = 'https://youtu.be/dQw4w9WgXcQ'; content = "UTF-8 저장 확인`n두 번째 줄"; status = 'NEW' }
    $post = Send-Json POST '/posts' $inputPost $authorized
    if ($post.title -ne $inputPost.title -or $post.content -ne $inputPost.content) { throw '한글 저장 불일치' }
    $list = Send-Json GET '/posts' $null $headers
    if (-not ($list | Where-Object id -eq $post.id)) { throw '목록에서 신규 게시물을 찾을 수 없습니다.' }
    $inputPost.title = '[자동 검증] 수정한 제목'
    $inputPost.status = 'DONE'
    $inputPost.version = $post.version
    $post = Send-Json PUT "/posts/$($post.id)" $inputPost $authorized
    if ($post.status -ne 'DONE' -or $post.title -ne $inputPost.title) { throw '게시물 수정 실패' }
    $stats = Send-Json GET '/posts/stats' $null $headers
    if ($stats.doneCount -lt 1) { throw '완료 통계 조회 실패' }
    $renewed = Send-Json POST '/auth/refresh' $null $headers
    if (-not $renewed.accessToken) { throw '갱신 토큰 회전 실패' }
    Write-Output 'PASS: Oracle 한글 등록, 전체 목록, 수정, 상태 변경, MyBatis 통계, Redis 갱신 토큰'
} finally {
    if ($null -ne $post) {
        Send-Json DELETE "/posts/$($post.id)?version=$($post.version)" $null $authorized | Out-Null
        Write-Output 'PASS: 이 스크립트에서 생성한 테스트 게시물 삭제'
    }
    Send-Json POST '/auth/logout' $null $headers | Out-Null
}
