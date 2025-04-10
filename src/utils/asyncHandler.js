// const asyncHandler = () => {
   
// }


// const asyncHandler = (fn) => (req, res, next).then((result) => {
//     res.status(200).json({
//         success: true,
//         data: result
//     })
// }).catch((err) => {
//     res.status(err.code || 500).json({
//                 success: false,
//                  message: err.message
//             })
// });


const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    }
}

export default asyncHandler;

// const asyncHandler = (fn) => async(req, res, next) => {
//    try {
//     await fn(req, res, next)
//    } catch (err) {
//     res.status(err.code || 500).json({
//         success: false,
//         message: err.message
//     })
//    }
// }