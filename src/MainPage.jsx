import { useEffect, useState } from "react";
import { firestoreDb } from "./firebase";
import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

import "./styles/adminStyles.css";
import "./styles/App.css";
import "./styles/userStyles.css";
function MainPage() {
  const tradeNotification =
    "Уважаемые участники, во время вашего хода вы можете изменить параметры торгов, указанных в таблице:";
  const discount = 25000;
  const adminKey = "a";
 
  const db = firestoreDb;
  
  const [isTradeStarted, setIsTradeStarted] = useState(false)
  const [isTradeCreated, setIsTradeCreated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTradeName, setAdminTradeName] = useState("");
  const [isAdminPanelHided, setIsAdminPanelHided] = useState(false);
  const [urlArr, setUrlArr] = useState([]);
  const [whichUserAmI, setWhichUserAmI] = useState(0);
  const [docId, setDocId] = useState("");
  const [data, setData] = useState([]);
  const [currentMove, setCurrentMove] = useState(0)



  const [companyName, setCompanyName] = useState(null);
  const [qualityStandards, setQualityStandards] = useState(null);
  const [productionTime, setProductionTime] = useState(null);
  const [warrantyTerm, setWarrantyTerm] = useState(null);
  const [paymentTerm, setPaymentTerm] = useState(null);
  const [productionCost, setProductionCost] = useState(null);



  const howIGetHere = window.location.pathname;

  const adminStyleChange = () => {
    setIsAdminPanelHided(!isAdminPanelHided);
    const panel = document.getElementById("admin_panel_main_div");
    if (isAdminPanelHided) {
      panel.style.height = "303px";
    } else {
      panel.style.height = "0px";
    }
  };

  const createNewTrade = () => {
    const new_trade_input = document.getElementById("new_trade_input");
    if (adminTradeName !== "") {
      tradeCreation();
    } else {
      new_trade_input.style.borderColor = "red";
      setTimeout(() => {
        new_trade_input.style.borderColor = "black";
      }, 400);
    }
  };
  const tradeCreation = async () => {
    let timedArr = [];
    try {
      const docRef = await addDoc(collection(db, "trades"), {
        name: adminTradeName,
        currentMove:-1,
        isStarted:false
      });
      setIsTradeCreated(true);
      setDocId(docRef.id)
      setWhichUserAmI('admin')
      for (let i = 1; i < 5; i++) {
        let constrUrl = `${docRef.id}-${i}`;
        timedArr.push({ url: constrUrl, id: i });
        console.log(timedArr);
      }
      setUrlArr(timedArr);
      console.log(
        "Успешное создание торгов, id:",
        docRef.id,
        "Список учатников:",
        timedArr
      );
    } catch (error) {
      console.error("Ошибка при создании нового лота(документа)", error);
    }
    
  };
  const sendDataFromUser=async()=>{
    if(currentMove==whichUserAmI||!isTradeStarted){

    
    if (!docId || whichUserAmI === 0) {
      console.error("Не задан id документа или пользователя");
      return;
    }
    if(companyName&&qualityStandards&&productionTime&&warrantyTerm&&paymentTerm&&productionCost){

      const userData = {
        id: whichUserAmI,
        companyName: companyName,
        qualityStandards: qualityStandards,
        productionTime: productionTime,
        warrantyTerm: warrantyTerm,
        paymentTerm: paymentTerm,
        productionCost: productionCost,
      };
      try {
        const userRef = doc(db, "trades", docId); 
        const userFieldPath = `user_${whichUserAmI}`;
        await updateDoc(userRef, {
          [userFieldPath]: userData,
        });
        console.log("Данные успешно сохранены в Firestore");
      } catch (error) {
        console.error("Ошибка при сохранении данных в Firestore: ", error);
      }
    }
  }
  }
  
  
  
  
  
  const startTrade = async() => {
    setIsTradeStarted(true)
  };

  const authorizationHandler = ()=>{
    if ([...howIGetHere].length >= 23) {
      let timedArrForId = [];
      let timedId = [];
      let pointer = 0;
      for (let i = 1; i < [...howIGetHere].length; i++) {
        if ([...howIGetHere][i] == "-") {
          pointer = 1;
        }
      
        if (pointer == 0) {
          timedArrForId.push([...howIGetHere][i]);
        }
        if (pointer == 1) {
          timedId.push([...howIGetHere][i + 1]);
        }
      }
      setDocId(timedArrForId.join(""));
      setWhichUserAmI(timedId.join(""));
      setIsAdmin(false);
    } else {
      const newUser = prompt(
        'Введите пароль (если его нет, то нажмите "Отмена")'
      );
      if (newUser === adminKey) {
        setIsAdmin(true);
      }
    }
  }
  const dataFetching= () =>{
    if (!docId) {
      console.error("Не задан id документа");
      return;
    }
    const userRef = doc(db, "trades", docId);
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const documentData = docSnapshot.data();
        setAdminTradeName(documentData.name)
        setCurrentMove(documentData.currentMove)
        setIsTradeStarted(documentData.isStarted)
        console.log(documentData.isStarted)
        const usersData = Object.keys(documentData)
          .filter((key) => key.startsWith("user_"))
          .map((key) => documentData[key]);
  
        setData(usersData);
        
      } else {
        console.error("Документ не найден!");
      }
    }, (error) => {
      console.error(error);
    });
    return () => unsubscribe();
  }
  useEffect(() => {
    authorizationHandler()
  }, []);

  useEffect(() => {
    dataFetching()
   
  }, [docId]);

  useEffect(()=>{
    const btn = document.getElementById('sendUserDataBtn')
   if(btn){
    if(currentMove==whichUserAmI||!isTradeStarted){
      console.log(currentMove,whichUserAmI)
      btn.style.backgroundColor = 'green'
    }else{
        btn.style.backgroundColor = 'red'
    }
   }
    
  },[currentMove])




  const inputTradeNameHandler = async (e) => {
    setAdminTradeName(e.target.value);
  };


  const companyNameHandler = (e) => {
    setCompanyName(e.target.value);
  };
  const qualityStandardsHandler = (e) => {
    setQualityStandards(e.target.value);
  };
  const productionTimeHandler = (e) => {
    setProductionTime(e.target.value);
    console.log(e.target.value);
  };
  const warrantyTermHandler = (e) => {
    setWarrantyTerm(e.target.value);
  };
  const paymentTermHandler = (e) => {
    setPaymentTerm(e.target.value);
  };
  const productionCostHandler = (e) => {
    setProductionCost(e.target.value);
  };
  return (
    <div className="App">
      {isAdmin && !isTradeCreated ? (
        <div className="new_trade_div">
          <p>Введите название торгов</p>
          <input
            id="new_trade_input"
            onChange={(e) => inputTradeNameHandler(e)}
          ></input>
          <button onClick={() => createNewTrade()}>Создать новый лот</button>
        </div>
      ) : (
        <>
          <div className="header">
            <div className="header_trade">
              <p className="header_trade_text">Ход торгов</p>
              <p className="header_trade_name">{adminTradeName}</p>
            </div>
            {!isAdmin ? (
              <div className="user_panel">
                <p className="header_trade_notification">{tradeNotification}</p>
                <div className="user_inputs_div">
                  <input onChange={(e) => companyNameHandler(e)}
                    type="text"
                    placeholder="Название компании"
                  />
                  <input onChange={(e) => qualityStandardsHandler(e)}
                    type="text"
                    title="Наличие комплекса мероприятий, повышающих стандарты качества изготовления"
                    placeholder="Наличие комплекса мероприятий, повышающих стандарты качества изготовления"
                  />
                  <input onChange={(e) => productionTimeHandler(e)}
                    type="number"
                    placeholder="Срок изготовления лота (в днях)"
                  />
                  <input onChange={(e) => warrantyTermHandler(e)}
                    type="number"
                    placeholder="Гарантийные обязательства (в мес.)"
                  />
                  <input onChange={(e) => paymentTermHandler(e)}
                    type="number"
                    placeholder="Условия оплаты (в %)"
                    
                  />
                  <input onChange={(e) => productionCostHandler(e)}
                    type="number"
                    placeholder="Стоимость изготовления лота (в руб.)"
                  />
                </div>
                
                <button id='sendUserDataBtn' onClick={()=>sendDataFromUser()}>Сохранить и отправить</button>
                
              </div>
            ) : (
              <div className="admin_panel">
                <div className="admin_panel_main_div" id="admin_panel_main_div">
                  <h2>Ссылки для участников торгов</h2>
                  <table className="header_trade_urls">
                    <thead>
                      <tr>
                        <th>Участник</th>
                        <th>URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {urlArr.map((item) => (
                        <tr key={item.url}>
                          <td>Участник {item.id}</td>
                          <td>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                            >{`${window.location.origin}/${item.url}`}</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="admin_panel_btn_div">
                  <button onClick={() => adminStyleChange()}>
                    {!isAdminPanelHided ? "Скрыть панель" : "Показать панель"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th className="move_name">ХОД</th>
                {data.map((item, index) => (
                  <th id={`step`+item.id} key={item.id} >
                     
                    {currentMove==item.id&&
                    <div className="timer current_timer" >
                    <p>00:00:30</p>
                    <svg
                      enableBackground="new 0 0 384.668 384.668"
                      viewBox="0 0 384.668 384.668"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="m295.326 124.149c9.493-8.252 14.89-20.226 14.89-32.821v-66.51h24.817c6.825 0 12.409-5.584 12.409-12.409s-5.584-12.409-12.408-12.409h-24.817-235.765-24.817c-6.825 0-12.409 5.584-12.409 12.409s5.584 12.409 12.409 12.409h24.817v72.591c0 12.657 5.46 24.693 15.077 32.945l55.094 47.773c4.157 3.599 6.515 8.686 6.515 14.208s-2.296 10.609-6.515 14.208l-55.094 47.711c-9.617 8.314-15.077 20.35-15.077 33.007v72.591h-24.817c-6.825 0-12.409 5.584-12.409 12.409s5.584 12.409 12.409 12.409h24.817 235.764 24.817c6.825 0 12.409-5.584 12.409-12.409s-5.584-12.409-12.409-12.409h-24.817v-66.51c0-12.595-5.46-24.569-14.89-32.821l-61.795-54.04c-4.157-3.599-6.39-8.624-6.39-14.146s2.296-10.547 6.39-14.146zm-78.113 101.006 61.795 54.04c4.095 3.599 6.39 8.748 6.39 14.146v66.51h-186.129v-72.591c0-5.46 2.358-10.609 6.453-14.208l55.094-47.711c9.555-8.314 15.077-20.288 15.077-32.945s-5.46-24.693-15.077-32.945l-55.094-47.773c-4.095-3.599-6.453-8.81-6.453-14.27v-72.591h186.13v66.51c0 5.398-2.358 10.547-6.453 14.146l-61.795 54.04c-9.431 8.252-14.89 20.226-14.89 32.821s5.46 24.569 14.952 32.821z" />
                      <path d="m272.99 91.328v-9.927c0-3.847-3.102-6.949-6.887-6.949h-147.538c-3.785 0-6.887 3.102-6.887 6.887v16.069c0 3.661 1.613 7.135 4.343 9.493l54.226 47.029c6.701 5.832 12.223 13.091 15.139 21.467 7.073 20.102.869 41.445-14.27 54.536l-55.094 47.773c-2.73 2.42-4.343 5.832-4.343 9.493v54.66c0 3.102 2.482 5.584 5.522 5.584h150.269c3.04 0 5.522-2.482 5.522-5.522v-48.58c0-3.661-1.551-7.073-4.281-9.493l-60.74-53.171c-6.639-5.832-12.098-13.029-15.077-21.343-7.135-20.04-.993-41.321 14.022-54.536l61.795-54.04c2.728-2.357 4.279-5.832 4.279-9.43z" />
                    </svg>
                    </div>
                    }
                
                   
                  </th>
                ))}
                
              </tr>
              <tr className="table_naming">
                <th>ПАРАМЕТРЫ И ТРЕБОВАНИЯ</th>
                {data.map((item, index) => (
                  <th  key={item.id}>
                    
                    {whichUserAmI==item.id?<p>Вы</p>:<p>УЧАСТНИК №{item.id}</p>}
                    <p>{item.companyName}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Наличие комплекса мероприятий, повышающих стандарты качества
                  изготовления
                </td>
                {data.map((item) => (
                  <td key={item.id}>{item.qualityStandards}</td>
                ))}
              </tr>
              <tr>
                <td>Срок изготовления лота, дней</td>
                {data.map((item) => (
                  <td key={item.id}>{item.productionTime}</td>
                ))}
              </tr>
              <tr>
                <td>Гарантийные обязательства, мес</td>
                {data.map((item) => (
                  <td key={item.id}>{item.warrantyTerm}</td>
                ))}
              </tr>
              <tr>
                <td>Условия оплаты</td>
                {data.map((item) => (
                  <td key={item.id}>{item.paymentTerm}%</td>
                ))}
              </tr>
              <tr>
                <td>Стоимость изготовления лота, руб. (без НДС)</td>
                {data.map((item) => (
                  <td key={item.id}>
                    <p className="blue-text">
                      {item.productionCost.toLocaleString()} руб.
                    </p>
                    <p className="red-text">
                      - {discount.toLocaleString()} руб.
                    </p>
                    <p className="green-text">
                      {(item.productionCost - discount).toLocaleString()} руб.
                    </p>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Действия:</td>
              </tr>
            </tbody>
          </table>
          {isAdmin && isTradeCreated && (
            <div className="options_menu">
              <button onClick={() => startTrade}>Начать торги</button>
              <button>Завершить торги</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MainPage;