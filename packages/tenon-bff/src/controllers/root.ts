import { BaseController, Controller, RequestContext, Next, io, useRouter, Get } from "@tenon/node-framework";

@Controller({
  prefixPath: '',
})
class RootController extends BaseController {

  @useRouter
  async getHandler(
    ctx: RequestContext,
    next: Next,
  ) {
    if (ctx.method === 'options') {
      return ctx.body = '';
    }
    ctx._startTime = Date.now();
    await next();
    ctx._endTime = Date.now();
    io.log(
      `request`,
      io.bold(`[${ctx.method.toUpperCase()}]${ctx.path}`),
      `cost ${ctx._endTime - ctx._startTime}ms`
    );
  }


  @Get("/")
  async homePage(
    ctx: RequestContext,
    next: Next,
  ) {
    this.response(ctx, next)("<h1>Tenon --Doctorwu</h1>");
  }
}

export { RootController };