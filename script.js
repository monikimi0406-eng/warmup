// 画面に表示する要素を取得しておく
const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttons = document.querySelectorAll('.btn');

// 入力中の式を文字列として保持する（例: "12+3"）
let expression = '';
// ＝を押した直後かどうかを覚えておくフラグ
// （＝の直後に数字を押したら、新しい計算として入力し直すため）
let justCalculated = false;
// ＝を押したときに計算した式（上段に「12+3=」のように表示するため）
let lastCalculation = '';

// すべてのボタンにクリックイベントを設定する
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
      case 'number':
        inputNumber(value);
        break;
      case 'decimal':
        inputDecimal();
        break;
      case 'operator':
        inputOperator(value);
        break;
      case 'delete':
        deleteLast();
        break;
      case 'clear':
        clearAll();
        break;
      case 'equal':
        calculate();
        break;
    }

    updateDisplay();
  });
});

// 数字ボタンが押されたときの処理
function inputNumber(value) {
  // ＝の直後に数字を押したら、新しい入力として最初からやり直す
  if (justCalculated) {
    expression = '';
    justCalculated = false;
  }
  expression += value;
}

// 「．」ボタンが押されたときの処理
function inputDecimal() {
  if (justCalculated) {
    expression = '';
    justCalculated = false;
  }

  // 今入力している数値の部分だけを取り出す
  const parts = expression.split(/[+\-*/]/);
  const currentNumber = parts[parts.length - 1];

  // すでに小数点が入っている場合は追加しない
  if (currentNumber.includes('.')) {
    return;
  }

  // 何も入力されていない状態で「．」を押したら「0．」から始める
  if (currentNumber === '') {
    expression += '0';
  }

  expression += '.';
}

// 四則演算ボタン（＋−×÷）が押されたときの処理
function inputOperator(value) {
  justCalculated = false;

  if (expression === '') {
    // 何も入力されていない状態では演算子から始められない
    return;
  }

  const lastChar = expression[expression.length - 1];
  const isOperator = ['+', '-', '*', '/'].includes(lastChar);

  if (isOperator) {
    // 直前も演算子だった場合は、新しい演算子に置き換える
    expression = expression.slice(0, -1) + value;
  } else {
    expression += value;
  }
}

// ⌫ボタンが押されたときの処理（最後の1文字を消す）
function deleteLast() {
  expression = expression.slice(0, -1);
  justCalculated = false;
}

// Cボタンが押されたときの処理（すべてリセット）
function clearAll() {
  expression = '';
  justCalculated = false;
}

// ＝ボタンが押されたときの処理（計算を実行する）
function calculate() {
  if (expression === '') {
    return;
  }

  try {
    const answer = evaluateExpression(expression);

    // 上段に表示する「計算した式」を覚えておく
    lastCalculation = expression
      .replace(/\*/g, '×')
      .replace(/\//g, '÷');

    // 計算結果を新しい式として表示する
    expression = String(answer);
    justCalculated = true;
  } catch (error) {
    // 「1+」のように式が不完全な場合はエラー表示にする
    expression = 'エラー';
    justCalculated = true;
  }
}

// 数字と演算子だけで構成された文字列を計算する
// （四則演算の優先順位を守って計算する）
function evaluateExpression(text) {
  // 数値と演算子に分解する（例: "12+3*4" → ["12", "+", "3", "*", "4"]）
  const tokens = text.match(/(\d+\.?\d*|[+\-*/])/g);
  if (!tokens) {
    throw new Error('式が正しくありません');
  }

  // 先に掛け算・割り算だけを計算して、トークンをまとめていく
  const step1 = [];
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];

    if (token === '*' || token === '/') {
      const left = parseFloat(step1.pop());
      const right = parseFloat(tokens[index + 1]);
      const value = token === '*' ? left * right : left / right;
      step1.push(String(value));
      index += 2;
    } else {
      step1.push(token);
      index += 1;
    }
  }

  // 残った足し算・引き算を左から順に計算する
  let total = parseFloat(step1[0]);
  for (let i = 1; i < step1.length; i += 2) {
    const operator = step1[i];
    const right = parseFloat(step1[i + 1]);
    total = operator === '+' ? total + right : total - right;
  }

  return total;
}

// 画面表示を最新の状態に更新する
function updateDisplay() {
  // 入力中の式の記号を、見やすい記号（×÷）に変換して表示する
  const displayExpression = expression
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');

  if (justCalculated) {
    // 計算後：上段に計算した式、下段に結果を表示する
    expressionEl.textContent = expression === 'エラー' ? '' : `${lastCalculation} =`;
    resultEl.textContent = expression;
  } else {
    // 入力中：上段は空、下段に入力中の式を表示する
    expressionEl.textContent = '';
    resultEl.textContent = displayExpression === '' ? '0' : displayExpression;
  }
}
